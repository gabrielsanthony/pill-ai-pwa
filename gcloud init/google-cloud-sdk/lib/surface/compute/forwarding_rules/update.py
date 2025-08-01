# -*- coding: utf-8 -*- #
# Copyright 2017 Google LLC. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Command to update forwarding-rules."""

from __future__ import absolute_import
from __future__ import division
from __future__ import unicode_literals

from apitools.base.protorpclite import messages as message_proto
from googlecloudsdk.api_lib.compute import base_classes
from googlecloudsdk.api_lib.compute import constants
from googlecloudsdk.calliope import base
from googlecloudsdk.calliope import exceptions as calliope_exceptions
from googlecloudsdk.command_lib.compute import flags as compute_flags
from googlecloudsdk.command_lib.compute.forwarding_rules import exceptions as fw_exceptions
from googlecloudsdk.command_lib.compute.forwarding_rules import flags
from googlecloudsdk.command_lib.util.args import labels_util


def _Args(
    cls,
    parser,
    support_network_tier,
    support_traffic_disabled,
):
  """Add the flags to create a forwarding rule."""
  cls.FORWARDING_RULE_ARG = flags.ForwardingRuleArgument()
  cls.FORWARDING_RULE_ARG.AddArgument(parser)
  labels_util.AddUpdateLabelsFlags(parser)
  if support_network_tier:
    flags.AddNetworkTier(parser, for_update=True)
  if support_traffic_disabled:
    flags.AddTrafficDisabled(parser)
  flags.AddSourceIpRanges(parser)
  flags.AddAllowGlobalAccess(parser)
  flags.AddAllowPscGlobalAccess(parser)
  flags.AddExternalMigration(parser)


@base.UniverseCompatible
@base.ReleaseTracks(base.ReleaseTrack.GA)
class UpdateGA(base.UpdateCommand):
  """Update a Compute Engine forwarding rule."""

  FORWARDING_RULE_ARG = None

  _support_network_tier = False
  _support_traffic_disabled = False

  @classmethod
  def Args(cls, parser):
    _Args(
        cls,
        parser,
        support_network_tier=cls._support_network_tier,
        support_traffic_disabled=cls._support_traffic_disabled,
    )

  def _CreateGlobalSetLabelsRequest(self, messages, forwarding_rule_ref,
                                    forwarding_rule, replacement):
    return messages.ComputeGlobalForwardingRulesSetLabelsRequest(
        project=forwarding_rule_ref.project,
        resource=forwarding_rule_ref.Name(),
        globalSetLabelsRequest=messages.GlobalSetLabelsRequest(
            labelFingerprint=forwarding_rule.labelFingerprint,
            labels=replacement))

  def _CreateRegionalSetLabelsRequest(self, messages, forwarding_rule_ref,
                                      forwarding_rule, replacement):
    return messages.ComputeForwardingRulesSetLabelsRequest(
        project=forwarding_rule_ref.project,
        resource=forwarding_rule_ref.Name(),
        region=forwarding_rule_ref.region,
        regionSetLabelsRequest=messages.RegionSetLabelsRequest(
            labelFingerprint=forwarding_rule.labelFingerprint,
            labels=replacement))

  def ConstructNetworkTier(self, messages, network_tier):
    if network_tier:
      network_tier = network_tier.upper()
      if network_tier in constants.NETWORK_TIER_CHOICES_FOR_INSTANCE:
        return messages.ForwardingRule.NetworkTierValueValuesEnum(network_tier)
      else:
        raise calliope_exceptions.InvalidArgumentException(
            '--network-tier',
            'Invalid network tier [{tier}]'.format(tier=network_tier))
    else:
      return

  def _HasNextTierChange(self, args):
    return self._support_network_tier and args.network_tier is not None

  def _HasSourceIpRangeChange(self, args):
    return args.IsSpecified('source_ip_ranges')

  def _HasGlobalAccessChange(self, args):
    return args.IsSpecified('allow_global_access')

  def _HasPscGlobalAccessChange(self, args):
    return args.IsSpecified('allow_psc_global_access')

  def _HasTrafficDisabledChange(self, args):
    return self._support_traffic_disabled and args.IsSpecified(
        'traffic_disabled'
    )

  def _HasExternalMigrationChange(self, args):
    return (
        args.IsSpecified(
            'external_managed_backend_bucket_migration_testing_percentage'
        )
        or args.IsSpecified('external_managed_backend_bucket_migration_state')
        or args.IsSpecified(
            'clear_external_managed_backend_bucket_migration_state'
        )
        or args.IsSpecified('load_balancing_scheme')
    )

  def Modify(
      self, messages: message_proto, args, existing, cleared_fields
  ) -> message_proto.Message:
    """Returns a modified forwarding rule message and included fields."""
    has_change = False
    forwarding_rule = messages.ForwardingRule(name=existing.name)

    if self._HasNextTierChange(args):
      forwarding_rule.networkTier = self.ConstructNetworkTier(
          messages, args.network_tier)
      has_change = True

    if self._HasSourceIpRangeChange(args):
      forwarding_rule.sourceIpRanges = args.source_ip_ranges
      has_change = True

    if self._HasGlobalAccessChange(args):
      forwarding_rule.allowGlobalAccess = args.allow_global_access
      has_change = True

    if self._HasPscGlobalAccessChange(args):
      forwarding_rule.allowPscGlobalAccess = args.allow_psc_global_access
      forwarding_rule.fingerprint = existing.fingerprint
      has_change = True

    if self._HasTrafficDisabledChange(args):
      forwarding_rule.trafficDisabled = args.traffic_disabled
      has_change = True

    if args.IsSpecified('external_managed_backend_bucket_migration_state'):
      forwarding_rule.externalManagedBackendBucketMigrationState = messages.ForwardingRule.ExternalManagedBackendBucketMigrationStateValueValuesEnum(
          args.external_managed_backend_bucket_migration_state
      )
      has_change = True

    if args.IsSpecified(
        'external_managed_backend_bucket_migration_testing_percentage'
    ):
      forwarding_rule.externalManagedBackendBucketMigrationTestingPercentage = (
          args.external_managed_backend_bucket_migration_testing_percentage
      )
      has_change = True

    if args.IsSpecified('load_balancing_scheme'):
      forwarding_rule.loadBalancingScheme = (
          messages.ForwardingRule.LoadBalancingSchemeValueValuesEnum(
              args.load_balancing_scheme
          )
      )
      has_change = True

    if args.IsSpecified(
        'clear_external_managed_backend_bucket_migration_state'
    ):
      cleared_fields.append('externalManagedBackendBucketMigrationState')
      cleared_fields.append(
          'externalManagedBackendBucketMigrationTestingPercentage'
      )
      has_change = True

    if not has_change:
      return None

    return forwarding_rule

  def Run(self, args):
    """Returns a list of requests necessary for updating forwarding rules."""
    holder = base_classes.ComputeApiHolder(self.ReleaseTrack())
    client = holder.client.apitools_client
    messages = holder.client.messages

    forwarding_rule_ref = self.FORWARDING_RULE_ARG.ResolveAsResource(
        args,
        holder.resources,
        scope_lister=compute_flags.GetDefaultScopeLister(holder.client))

    labels_diff = labels_util.Diff.FromUpdateArgs(args)
    has_labels_updates = labels_diff.MayHaveUpdates()

    has_change = any([
        has_labels_updates,
        self._HasNextTierChange(args),
        self._HasGlobalAccessChange(args),
        self._HasPscGlobalAccessChange(args),
        self._HasTrafficDisabledChange(args),
        self._HasSourceIpRangeChange(args),
        self._HasExternalMigrationChange(args),
    ])

    if not has_change:
      raise fw_exceptions.ArgumentError(
          'At least one property must be specified.')

    # Get replacement.
    if forwarding_rule_ref.Collection() == 'compute.globalForwardingRules':
      get_request = (client.globalForwardingRules, 'Get',
                     messages.ComputeGlobalForwardingRulesGetRequest(
                         forwardingRule=forwarding_rule_ref.Name(),
                         project=forwarding_rule_ref.project))
      labels_value = messages.GlobalSetLabelsRequest.LabelsValue
    else:
      get_request = (client.forwardingRules, 'Get',
                     messages.ComputeForwardingRulesGetRequest(
                         forwardingRule=forwarding_rule_ref.Name(),
                         project=forwarding_rule_ref.project,
                         region=forwarding_rule_ref.region))
      labels_value = messages.RegionSetLabelsRequest.LabelsValue

    objects = holder.client.MakeRequests([get_request])
    forwarding_rule = objects[0]

    cleared_fields = []
    forwarding_rule_replacement = self.Modify(
        messages, args, forwarding_rule, cleared_fields
    )
    label_update = labels_diff.Apply(labels_value, forwarding_rule.labels)

    # Create requests.
    requests = []

    if forwarding_rule_ref.Collection() == 'compute.globalForwardingRules':
      if forwarding_rule_replacement:
        request = messages.ComputeGlobalForwardingRulesPatchRequest(
            forwardingRule=forwarding_rule_ref.Name(),
            forwardingRuleResource=forwarding_rule_replacement,
            project=forwarding_rule_ref.project)
        requests.append((client.globalForwardingRules, 'Patch', request))
      if label_update.needs_update:
        request = self._CreateGlobalSetLabelsRequest(messages,
                                                     forwarding_rule_ref,
                                                     forwarding_rule,
                                                     label_update.labels)
        requests.append((client.globalForwardingRules, 'SetLabels', request))
    else:
      if forwarding_rule_replacement:
        request = messages.ComputeForwardingRulesPatchRequest(
            forwardingRule=forwarding_rule_ref.Name(),
            forwardingRuleResource=forwarding_rule_replacement,
            project=forwarding_rule_ref.project,
            region=forwarding_rule_ref.region)
        requests.append((client.forwardingRules, 'Patch', request))
      if label_update.needs_update:
        request = self._CreateRegionalSetLabelsRequest(messages,
                                                       forwarding_rule_ref,
                                                       forwarding_rule,
                                                       label_update.labels)
        requests.append((client.forwardingRules, 'SetLabels', request))

    with client.IncludeFields(cleared_fields):
      return holder.client.MakeRequests(requests)


@base.ReleaseTracks(base.ReleaseTrack.BETA)
class UpdateBeta(UpdateGA):
  """Update a Compute Engine forwarding rule."""

  _support_network_tier = False
  _support_traffic_disabled = False


@base.ReleaseTracks(base.ReleaseTrack.ALPHA)
class UpdateAlpha(UpdateBeta):
  """Update a Compute Engine forwarding rule."""

  _support_network_tier = True
  _support_traffic_disabled = True


UpdateGA.detailed_help = {
    'brief':
        'Update a Compute Engine forwarding rule.',
    'DESCRIPTION':
        """\
        *{command}* updates global access for a Compute Engine forwarding rule.
        """,
    'EXAMPLES':
        """\
        To update the forwarding rule to allow global access, run:

          $ {command} example-fr --allow-global-access --region=us-central1

        To add/update labels ``k0'' and ``k1'' and remove labels with key ``k3'',
        run:

          $ {command} example-fr --region=us-central1 \
          --update-labels=k0=value1,k1=value2 --remove-labels=k3

        Labels can be used to identify the forwarding rule and to filter them as
        in

          $ {parent_command} list --filter='labels.k1:value2'

        To list existing labels, run:

          $ {parent_command} describe example-fr --format="default(labels)"
        """
}

UpdateBeta.detailed_help = {
    'brief':
        'Update a Compute Engine forwarding rule.',
    'DESCRIPTION':
        """\
        *{command}* updates labels and global access for a Compute
        Engine forwarding rule.
        """,
    'EXAMPLES':
        """\
        To update the forwarding rule to allow global access, run:

          $ {command} example-fr --allow-global-access --region=us-central1

        To add/update labels ``k0'' and ``k1'' and remove labels with key ``k3'',
        run:

          $ {command} example-fr --region=us-central1 \
          --update-labels=k0=value1,k1=value2 --remove-labels=k3

        Labels can be used to identify the forwarding rule and to filter them as
        in

          $ {parent_command} list --filter='labels.k1:value2'

        To list existing labels, run:

          $ {parent_command} describe example-fr --format="default(labels)"
        """
}

UpdateAlpha.detailed_help = {
    'brief':
        'Update a Compute Engine forwarding rule.',
    'DESCRIPTION':
        """\
        *{command}* updates labels, global access and network tier for a Compute
        Engine forwarding rule.
        """,
    'EXAMPLES':
        """\
        To update the forwarding rule to allow global access, run:

          $ {command} example-fr --allow-global-access --region=us-central1

        To add/update labels ``k0'' and ``k1'' and remove labels with key ``k3''
        , run:

          $ {command} example-fr --region=us-central1 \
            --update-labels=k0=value1,k1=value2 --remove-labels=k3

        Labels can be used to identify the forwarding rule and to filter them as
        in

          $ {parent_command} list --filter='labels.k1:value2'

        To list existing labels, run:

          $ {parent_command} describe example-fr --format="default(labels)"
        """
}

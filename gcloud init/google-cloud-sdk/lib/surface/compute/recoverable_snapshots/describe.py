# -*- coding: utf-8 -*- #
# Copyright 2025 Google LLC. All Rights Reserved.
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
"""Command for describing recoverable snapshots."""

from __future__ import absolute_import
from __future__ import division
from __future__ import unicode_literals

from googlecloudsdk.api_lib.compute import base_classes
from googlecloudsdk.calliope import base
from googlecloudsdk.command_lib.compute import flags as compute_flags
from googlecloudsdk.command_lib.compute import scope as compute_scope
from googlecloudsdk.command_lib.compute.recoverable_snapshots import flags


def _AlphaArgs(parser):
  Describe.RecoverableSnapshotArg = (
      flags.MakeRecoverableSnapshotArg()
  )
  Describe.RecoverableSnapshotArg.AddArgument(parser, operation_type='describe')


@base.Hidden
@base.ReleaseTracks(base.ReleaseTrack.ALPHA)
@base.DefaultUniverseOnly
class Describe(base.DescribeCommand):
  """Describe a Compute Engine recoverable snapshot."""

  @staticmethod
  def Args(parser):
    _AlphaArgs(parser)

  def Run(self, args):
    return self._Run(args)

  def _Run(self, args):
    holder = base_classes.ComputeApiHolder(self.ReleaseTrack())
    client = holder.client
    messages = client.messages

    recoverable_snapshot_ref = (
        Describe.RecoverableSnapshotArg.ResolveAsResource(
            args,
            holder.resources,
            scope_lister=compute_flags.GetDefaultScopeLister(client),
            default_scope=compute_scope.ScopeEnum.GLOBAL,
        )
    )

    request = messages.ComputeRecoverableSnapshotsGetRequest(
        **recoverable_snapshot_ref.AsDict()
    )
    return client.MakeRequests(
        [(client.apitools_client.recoverableSnapshots, 'Get', request)]
    )[0]


Describe.detailed_help = {
    'DESCRIPTION': """\
        *{command}* displays all data associated with a Compute Engine
        recoverable snapshot in the project.
        """,
    'EXAMPLES': """\
        To describe a global recoverable snapshot, run:
          $ {command} my-recoverable-snapshot
        """,
}

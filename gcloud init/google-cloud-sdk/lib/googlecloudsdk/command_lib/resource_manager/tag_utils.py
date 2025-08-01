# -*- coding: utf-8 -*- #
# Copyright 2019 Google LLC. All Rights Reserved.
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
"""Utilities for defining Tag resource manager arguments on a parser."""

from __future__ import absolute_import
from __future__ import division
from __future__ import unicode_literals

import re

from apitools.base.py import exceptions as apitools_exceptions
from googlecloudsdk.api_lib.compute import base_classes
from googlecloudsdk.api_lib.iam import util as iam_api
from googlecloudsdk.api_lib.resource_manager import tags
from googlecloudsdk.api_lib.resource_manager.exceptions import ResourceManagerError
from googlecloudsdk.calliope import exceptions
from googlecloudsdk.command_lib.iam import iam_util
from googlecloudsdk.command_lib.resource_manager import endpoint_utils as endpoints
from googlecloudsdk.core import exceptions as core_exceptions


class InvalidInputError(ResourceManagerError):
  """Exception for invalid input."""

TAG_KEYS = 'tagKeys'
TAG_VALUES = 'tagValues'
TAG_BINDINGS = 'tagBindings'

GetRequests = {
    TAG_KEYS: tags.TagMessages().CloudresourcemanagerTagKeysGetRequest,
    TAG_VALUES: tags.TagMessages().CloudresourcemanagerTagValuesGetRequest,
}

GetByNamespacedNameRequests = {
    TAG_KEYS: (
        tags.TagMessages().CloudresourcemanagerTagKeysGetNamespacedRequest
    ),
    TAG_VALUES: (
        tags.TagMessages().CloudresourcemanagerTagValuesGetNamespacedRequest
    ),
}

ListRequests = {
    TAG_KEYS: tags.TagMessages().CloudresourcemanagerTagKeysListRequest,
    TAG_VALUES: tags.TagMessages().CloudresourcemanagerTagValuesListRequest,
    TAG_BINDINGS: tags.TagMessages().CloudresourcemanagerTagBindingsListRequest,
}

Services = {
    TAG_KEYS: tags.TagKeysService,
    TAG_VALUES: tags.TagValuesService,
    TAG_BINDINGS: tags.TagBindingsService,
}

MAX_TAG_KEYS = 1000
MAX_TAG_VALUES = 1000


def GetResource(resource_name, resource_type):
  """Gets the resource from the resource name.

  Args:
    resource_name: The resource name, such as tagKeys/{tag_key_id} or
      tagValues/{tag_value_id}
    resource_type: the type of the resource i.e: tag_utils.TAG_KEYS,
      tag_utils.TAG_VALUES. Used to determine which service to use and which GET
      request to construct

  Returns:
    resource
  """

  # TagKeys and TagValues GET require the global CRM API endpoint.
  with endpoints.CrmEndpointOverrides('global'):
    service = Services[resource_type]()
    req = GetRequests[resource_type](name=resource_name)
    response = service.Get(req)

    return response


def GetNamespacedResource(namespaced_name, resource_type):
  """Gets the resource from the namespaced name.

  Args:
    namespaced_name: The namespaced name of the resource such as
      {parent_id}/{tag_key_short_name} or
      {parent_id}/{tag_key_short_name}/{tag_value_short_name}
    resource_type: the type of the resource i.e: tag_utils.TAG_KEYS,
      tag_utils.TAG_VALUES. Used to determine which service to use and which GET
      request to construct

  Returns:
    resource
  """

  # GetNamespacedTag(Key|Value) call requires the global CRM API endpoint.
  with endpoints.CrmEndpointOverrides('global'):
    service = Services[resource_type]()
    req = GetByNamespacedNameRequests[resource_type](name=namespaced_name)
    response = service.GetNamespaced(req)

    return response


def GetTagValueParent(parent):
  if parent.find('tagValues/') == 0 or parent.find('tagKeys/') == 0:
    tag_value_parent = parent
  else:
    if parent.count('/') == 1:
      tag_value_parent = GetNamespacedResource(parent, TAG_KEYS).name
    else:
      tag_value_parent = GetNamespacedResource(parent, TAG_VALUES).name
  return tag_value_parent


def ProjectNameToBinding(project_name, tag_value, location=None):
  """Returns the binding name given a project name and tag value.

  Requires binding list permission.

  Args:
    project_name: project name provided, fully qualified resource name
    tag_value: tag value to match the binding name to
    location: region or zone

  Returns:
    binding_name

  Raises:
    InvalidInputError: project not found
  """
  service = Services[TAG_BINDINGS]()
  with endpoints.CrmEndpointOverrides(location):
    req = ListRequests[TAG_BINDINGS](parent=project_name)

    response = service.List(req)

    for bn in response.tagBindings:
      if bn.tagValue == tag_value:
        return bn.name

    raise InvalidInputError(
        'Binding not found for parent [{}], tagValue [{}]'.format(
            project_name, tag_value
        )
    )


def GetCanonicalResourceName(resource_name, location, release_track):
  """Returns the correct canonical name for the given resource.

  Args:
    resource_name: name of the resource
    location: location in which the resource lives
    release_track: release stage of current endpoint

  Returns:
    resource_name: either the original resource name, or correct canonical name

  Raises:
    InvalidArgumentException: if the location is not specified
  """
  service_account_resource_name_pattern = (
      r'iam.*/projects/[^/]+/serviceAccounts/([^/]+)'
  )
  service_account_search = re.search(
      service_account_resource_name_pattern, resource_name
  )

  if service_account_search:
    service_account_name = service_account_search.group(1)
    # Call IAM's service account describe API to get the service account's
    # unique id.
    if re.search('.*@.*.gserviceaccount.com', service_account_name):
      resource_name = resource_name.replace(
          'serviceAccounts/%s' % service_account_name,
          'serviceAccounts/%s'
          % _GetServiceAccountUniqueId(service_account_name),
      )
    return resource_name

  # [a-z]([-a-z0-9]*[a-z0-9] is the instance name regex, as per
  # https://cloud.google.com/compute/docs/reference/rest/v1/instances

  gce_compute_instance_name_pattern = (
      r'compute.googleapis.com/projects/([^/]+)/.*instances/([^/]+)'
  )
  gce_search = re.search(gce_compute_instance_name_pattern, resource_name)

  if gce_search:
    if not location:
      raise exceptions.InvalidArgumentException(
          '--location',
          (
              'Please specify an appropriate cloud location with the --location'
              ' flag.'
          ),
      )
    project_identifier, instance_identifier = gce_search.group(
        1
    ), gce_search.group(2)
    # call compute instance's describe api to get canonical resource name
    # use that instead of the instance name that's in the parent
    if re.search('([a-z]([-a-z0-9]*[a-z0-9])?)', instance_identifier):
      resource_name = resource_name.replace(
          'instances/%s' % instance_identifier,
          'instances/%s'
          % _GetGceInstanceCanonicalName(
              project_identifier, instance_identifier, location, release_track
          ),
      )
  return resource_name


def _GetServiceAccountUniqueId(service_account_email):
  """Returns the unique id for the given service account email.

  Args:
    service_account_email: email of the service account.

  Returns:
    The unique id of the service account.
  """
  client, messages = iam_api.GetClientAndMessages()
  try:
    res = client.projects_serviceAccounts.Get(
        messages.IamProjectsServiceAccountsGetRequest(
            name=iam_util.EmailToAccountResourceName(service_account_email)))
    return str(res.uniqueId)
  except apitools_exceptions.HttpError as e:
    raise exceptions.HttpException(e)


def _GetGceInstanceCanonicalName(
    project_identifier, instance_identifier, location, release_track
):
  """Returns the correct canonical name for the given gce compute instance.

  Args:
    project_identifier: project number of the compute instance
    instance_identifier: name of the instance
    location: location in which the resource lives
    release_track: release stage of current endpoint

  Returns:
    instance_id: returns the canonical instance id
  """
  compute_holder = base_classes.ComputeApiHolder(release_track)
  client = compute_holder.client
  request = (
      client.apitools_client.instances,
      'Get',
      client.messages.ComputeInstancesGetRequest(
          instance=instance_identifier,
          project=project_identifier,
          zone=location,
      ),
  )
  errors_to_collect = []
  instances = client.MakeRequests(
      [request], errors_to_collect=errors_to_collect
  )
  if errors_to_collect:
    raise core_exceptions.MultiError(errors_to_collect)
  return str(instances[0].id)


def ParseTagGroup(args, original):
  """Parses the tag keys and values into a map to be used for update."""

  if args.IsSpecified('clear_tags'):
    return {}

  tags_map_to_update = {}

  if args.IsSpecified('update_tags'):
    tags_dict = args.update_tags

    tag_group = ExtractExistingTags(original, {})

    for tag_key, tag_value in tags_dict.items():
      tag_group[tag_key] = tag_value

    tags_map_to_update = tag_group

  if args.IsSpecified('remove_tags'):
    tags_list = args.remove_tags
    tag_group = tags_map_to_update

    tag_group = ExtractExistingTags(original, tag_group)

    for tag_key in tags_list:
      if '=' in tag_key:
        raise exceptions.InvalidArgumentException(
            '--remove_tags',
            'Please specify the tag key only in the namespaced format. i.e'
            ' --remove-tags=foo/bar,foo2/bar2',
        )
      if tag_key in tag_group:
        unused_removed_tag = tag_group.pop(tag_key)
        # remove the tag from the original tags
    tags_map_to_update.update(tag_group)

  if args.IsSpecified('replace_tags'):
    tags_dict = args.replace_tags
    tag_group = {}
    for tag_key, tag_value in tags_dict.items():
      tag_group[tag_key] = tag_value
    tags_map_to_update = tag_group

  return tags_map_to_update


def ExtractExistingTags(original, tag_group):
  """Extracts the existing tags from the original tags."""
  if original.tags:
    additional_property = original.tags.additionalProperties
    for property_item in additional_property:
      tag_group[property_item.key] = property_item.value
  return tag_group

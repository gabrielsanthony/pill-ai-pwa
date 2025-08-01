# -*- coding: utf-8 -*- #
# Copyright 2018 Google LLC. All Rights Reserved.
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
"""services helper functions."""
import collections
import copy
import enum
import sys
from typing import List

from apitools.base.py import encoding
from apitools.base.py import exceptions as apitools_exceptions
from apitools.base.py import list_pager
from googlecloudsdk.api_lib.services import exceptions
from googlecloudsdk.api_lib.services import services_util
from googlecloudsdk.api_lib.util import apis_internal
from googlecloudsdk.api_lib.util import http_retry
from googlecloudsdk.core import log
from googlecloudsdk.core import properties
from googlecloudsdk.core import transport

_PROJECT_RESOURCE = 'projects/%s'
_FOLDER_RESOURCE = 'folders/%s'
_ORGANIZATION_RESOURCE = 'organizations/%s'
_PROJECT_SERVICE_RESOURCE = 'projects/%s/services/%s'
_FOLDER_SERVICE_RESOURCE = 'folders/%s/services/%s'
_ORG_SERVICE_RESOURCE = 'organizations/%s/services/%s'
_SERVICE_RESOURCE = 'services/%s'
_DEPENDENCY_GROUP = '/groups/dependencies'
_REVERSE_CLOSURE = '/reverseClosure'
_CONSUMER_SERVICE_RESOURCE = '%s/services/%s'
_CONSUMER_POLICY_DEFAULT = '/consumerPolicies/%s'
_EFFECTIVE_POLICY = '/effectivePolicy'
_GOOGLE_CATEGORY_RESOURCE = 'categories/google'
_LIMIT_OVERRIDE_RESOURCE = '%s/consumerOverrides/%s'
_VALID_CONSUMER_PREFIX = frozenset({'projects/', 'folders/', 'organizations/'})
_V1_VERSION = 'v1'
_V1BETA1_VERSION = 'v1beta1'
_V1ALPHA_VERSION = 'v1alpha'
_V2ALPHA_VERSION = 'v2alpha'
_V2BETA_VERSION = 'v2beta'
_TOO_MANY_REQUESTS = 429

# Map of services which should be protected from being disabled by
# prompting the user for  confirmation
_PROTECTED_SERVICES = {
    'anthos.googleapis.com': ('Warning: Disabling this service will '
                              'also automatically disable any running '
                              'Anthos clusters.')
}


class ContainerType(enum.Enum):
  """Return the container type."""
  PROJECT_SERVICE_RESOURCE = 1
  FOLDER_SERVICE_RESOURCE = 2
  ORG_SERVICE_RESOURCE = 3


def GetProtectedServiceWarning(service_name):
  """Return the warning message associated with a protected service."""
  return _PROTECTED_SERVICES.get(service_name)


def GetConsumerPolicyV2Beta(policy_name):
  """Make API call to get a consumer policy.

  Args:
    policy_name: The name of a consumer policy. Currently supported format
      '{resource_type}/{resource_name}/consumerPolicies/default'. For example,
      'projects/100/consumerPolicies/default'.

  Raises:
    exceptions.GetConsumerPolicyPermissionDeniedException: when getting a
      consumer policy fails.
    apitools_exceptions.HttpError: Another miscellaneous error with the service.

  Returns:
    message.GoogleApiServiceusageV2betaConsumerPolicy: The consumer policy
  """
  client = _GetClientInstance(version=_V2BETA_VERSION)
  messages = client.MESSAGES_MODULE

  request = messages.ServiceusageConsumerPoliciesGetRequest(name=policy_name)

  try:
    return client.consumerPolicies.Get(request)
  except (
      apitools_exceptions.HttpForbiddenError,
      apitools_exceptions.HttpNotFoundError,
  ) as e:
    exceptions.ReraiseError(e, exceptions.GetConsumerPolicyException)


# TODO(b/393195807) Remove after the migration is completed.
def GetConsumerPolicyV2Alpha(policy_name):
  """Make API call to get a consumer policy.

  Args:
    policy_name: The name of a consumer policy. Currently supported format
      '{resource_type}/{resource_name}/consumerPolicies/default'. For example,
      'projects/100/consumerPolicies/default'.

  Raises:
    exceptions.GetConsumerPolicyPermissionDeniedException: when getting a
      consumer policy fails.
    apitools_exceptions.HttpError: Another miscellaneous error with the service.

  Returns:
    The consumer policy
  """
  client = _GetClientInstance(_V2ALPHA_VERSION)
  messages = client.MESSAGES_MODULE

  request = messages.ServiceusageConsumerPoliciesGetRequest(name=policy_name)

  try:
    return client.consumerPolicies.Get(request)
  except (
      apitools_exceptions.HttpForbiddenError,
      apitools_exceptions.HttpNotFoundError,
  ) as e:
    exceptions.ReraiseError(e, exceptions.GetConsumerPolicyException)


def TestEnabled(name: str, service: str):
  """Make API call to test enabled.

  Args:
    name: Parent resource to test a value against the result of merging consumer
      policies in the resource hierarchy. format-"projects/100", "folders/101"
      or "organizations/102".
    service: Service name to check if the targeted resource can use this
      service. Current supported value: SERVICE (format: "services/{service}").

  Raises:
    exceptions.TestEnabledPermissionDeniedException: when testing value for a
      service and resource.
    apitools_exceptions.HttpError: Another miscellaneous error with the service.

  Returns:
    Message.State: The state of the service.
  """
  client = _GetClientInstance(_V2BETA_VERSION)
  messages = client.MESSAGES_MODULE

  request = messages.ServiceusageTestEnabledRequest(
      name=name,
      testEnabledRequest=messages.TestEnabledRequest(serviceName=service),
  )

  try:
    return client.v2beta.TestEnabled(request)
  except (
      apitools_exceptions.HttpForbiddenError,
      apitools_exceptions.HttpNotFoundError,
  ) as e:
    exceptions.ReraiseError(e, exceptions.TestEnabledException)


def GetEffectivePolicyV2Beta(name: str, view: str = 'BASIC'):
  """Make API call to get a effective policy.

  Args:
    name: The name of the effective policy.Currently supported format
      '{resource_type}/{resource_name}/effectivePolicy'. For example,
      'projects/100/effectivePolicy'.
    view: The view of the effective policy to use. The default view is 'BASIC'.

  Raises:
    exceptions.GetEffectiverPolicyException: when getting a
      effective policy fails.
    apitools_exceptions.HttpError: Another miscellaneous error with the service.

  Returns:
    message.EffectivePolicy: The effective policy
  """
  client = _GetClientInstance(version=_V2BETA_VERSION)
  messages = client.MESSAGES_MODULE
  if view == 'BASIC':
    view_type = (
        messages.ServiceusageGetEffectivePolicyRequest.ViewValueValuesEnum.EFFECTIVE_POLICY_VIEW_BASIC
    )
  else:
    view_type = (
        messages.ServiceusageGetEffectivePolicyRequest.ViewValueValuesEnum.EFFECTIVE_POLICY_VIEW_FULL
    )

  request = messages.ServiceusageGetEffectivePolicyRequest(
      name=name, view=view_type
  )

  try:
    return client.v2beta.GetEffectivePolicy(request)
  except (
      apitools_exceptions.HttpForbiddenError,
      apitools_exceptions.HttpNotFoundError,
  ) as e:
    exceptions.ReraiseError(e, exceptions.GetEffectiverPolicyException)


# TODO(b/393195807) Remove after the migration is completed.
def GetEffectivePolicyV2Alpha(name: str, view: str = 'BASIC'):
  """Make API call to get a effective policy.

  Args:
    name: The name of the effective policy. Currently supported format
      '{resource_type}/{resource_name}/effectivePolicy'. For example,
      'projects/100/effectivePolicy'.
    view: The view of the effective policy to use. The default view is 'BASIC'.

  Raises:
    exceptions.GetEffectiverPolicyPermissionDeniedException: when getting a
      effective policy fails.
    apitools_exceptions.HttpError: Another miscellaneous error with the service.

  Returns:
    The Effective Policy
  """
  client = _GetClientInstance(_V2ALPHA_VERSION)
  messages = client.MESSAGES_MODULE
  if view == 'BASIC':
    view_type = (
        messages.ServiceusageGetEffectivePolicyRequest.ViewValueValuesEnum.EFFECTIVE_POLICY_VIEW_BASIC
    )
  else:
    view_type = (
        messages.ServiceusageGetEffectivePolicyRequest.ViewValueValuesEnum.EFFECTIVE_POLICY_VIEW_FULL
    )

  request = messages.ServiceusageGetEffectivePolicyRequest(
      name=name, view=view_type
  )

  try:
    return client.v2alpha.GetEffectivePolicy(request)
  except (
      apitools_exceptions.HttpForbiddenError,
      apitools_exceptions.HttpNotFoundError,
  ) as e:
    exceptions.ReraiseError(
        e, exceptions.GetEffectiverPolicyPermissionDeniedException
    )


def BatchGetService(parent, services):
  """Make API call to get service state for multiple services .

  Args:
    parent: Parent resource to get service state for. format-"projects/100",
      "folders/101" or "organizations/102".
    services: Services. Current supported value:(format:
      "{resource}/{resource_Id}/services/{service}").

  Raises:
    exceptions.BatchGetServiceException: when getting batch
      service state for services in the resource.
    apitools_exceptions.HttpError: Another miscellaneous error with the service.

  Returns:
    Message.BatchGetServicesResponse: Service state of the given resource.
  """
  client = _GetClientInstance(version=_V2BETA_VERSION)
  messages = client.MESSAGES_MODULE

  request = messages.ServiceusageServicesBatchGetRequest(
      parent=parent,
      services=services,
      view=messages.ServiceusageServicesBatchGetRequest.ViewValueValuesEnum.SERVICE_STATE_VIEW_FULL,
  )

  try:
    return client.services.BatchGet(request)
  except (
      apitools_exceptions.HttpForbiddenError,
      apitools_exceptions.HttpNotFoundError,
  ) as e:
    exceptions.ReraiseError(e, exceptions.BatchGetServiceException)


def ListCategoryServices(resource, category, page_size=200, limit=sys.maxsize):
  """Make API call to list category services .

  Args:
    resource: resource to get list for. format-"projects/100", "folders/101" or
      "organizations/102".
    category: category to get list for. format-"catgeory/<category>".
    page_size: The page size to list.default=200
    limit: The max number of services to display.

  Raises:
    exceptions.ListCategoryServicesException: when listing the
    services the parent category includes.
    apitools_exceptions.HttpError: Another miscellaneous error with the service.

  Returns:
    Message.ListCategoryServicesResponse: The services the parent category
    includes.
  """
  client = _GetClientInstance(version=_V2BETA_VERSION)
  messages = client.MESSAGES_MODULE

  request = messages.ServiceusageCategoriesCategoryServicesListRequest(
      parent='{}/{}'.format(resource, category),
  )

  try:
    return list_pager.YieldFromList(
        _Lister(client.categories_categoryServices),
        request,
        limit=limit,
        batch_size_attribute='pageSize',
        batch_size=page_size,
        field='services',
    )
  except (
      apitools_exceptions.HttpForbiddenError,
      apitools_exceptions.HttpNotFoundError,
  ) as e:
    exceptions.ReraiseError(e, exceptions.ListCategoryServicesException)


def UpdateConsumerPolicyV2Alpha(
    consumerpolicy, name, force=False, validateonly=False
):
  """Make API call to update a consumer policy.

  Args:
    consumerpolicy: The consumer policy to update.
    name: The resource name of the policy. Currently supported format
      '{resource_type}/{resource_name}/consumerPolicies/default. For example,
      'projects/100/consumerPolicies/default'.
    force: Disable service with usage within last 30 days or disable recently
      enabled service.
    validateonly: If set, validate the request and preview the result but do not
      actually commit it. The default is false.

  Raises:
    exceptions.UpdateConsumerPolicyPermissionDeniedException: when updating a
      consumer policy fails.
    apitools_exceptions.HttpError: Another miscellaneous error with the service.

  Returns:
    Updated consumer policy
  """
  client = _GetClientInstance('v2alpha')
  messages = client.MESSAGES_MODULE

  request = messages.ServiceusageConsumerPoliciesPatchRequest(
      googleApiServiceusageV2alphaConsumerPolicy=consumerpolicy,
      name=name,
      force=force,
      validateOnly=validateonly,
  )

  try:
    return client.consumerPolicies.Patch(request)
  except (
      apitools_exceptions.HttpForbiddenError,
      apitools_exceptions.HttpNotFoundError,
  ) as e:
    exceptions.ReraiseError(e, exceptions.UpdateConsumerPolicyException)
  except apitools_exceptions.HttpBadRequestError as e:
    log.status.Print(
        'Provide the --force flag if you wish to force disable services.'
    )
    exceptions.ReraiseError(e, exceptions.Error)


def UpdateConsumerPolicyV2Beta(
    consumerpolicy, name, force=False, validateonly=False
):
  """Make API call to update a consumer policy.

  Args:
    consumerpolicy: The consumer policy to update.
    name: The resource name of the policy. Currently supported format
      '{resource_type}/{resource_name}/consumerPolicies/default. For example,
      'projects/100/consumerPolicies/default'.
    force: Disable service with usage within last 30 days or disable recently
      enabled service.
    validateonly: If set, validate the request and preview the result but do not
      actually commit it. The default is false.

  Raises:
    exceptions.UpdateConsumerPolicyException: when updating a
      consumer policy fails.
    apitools_exceptions.HttpError: Another miscellaneous error with the service.

  Returns:
    Updated consumer policy
  """
  client = _GetClientInstance(_V2BETA_VERSION)
  messages = client.MESSAGES_MODULE

  request = messages.ServiceusageConsumerPoliciesPatchRequest(
      googleApiServiceusageV2betaConsumerPolicy=consumerpolicy,
      name=name,
      force=force,
      validateOnly=validateonly,
  )

  try:
    return client.consumerPolicies.Patch(request)
  except (
      apitools_exceptions.HttpForbiddenError,
      apitools_exceptions.HttpNotFoundError,
  ) as e:
    exceptions.ReraiseError(e, exceptions.UpdateConsumerPolicyException)
  except apitools_exceptions.HttpBadRequestError as e:
    log.status.Print(
        'Provide the --force flag if you wish to force disable services.'
    )
    exceptions.ReraiseError(e, exceptions.Error)


def ListGroupMembers(
    resource: str,
    service_group: str,
    page_size: int = 50,
    limit: int = sys.maxsize,
):
  """Make API call to list group members of a specific service group.

  Args:
    resource: The target resource.
    service_group: Service group which owns a collection of group members, for
      example, 'services/compute.googleapis.com/groups/dependencies'.
    page_size: The page size to list. The default page_size is 50.
    limit: The max number of services to display.

  Raises:
    exceptions.ListGroupMembersPermissionDeniedException: when listing
      group members fails.
    apitools_exceptions.HttpError: Another miscellaneous error with the service.

  Returns:
    Message.ListGroupMembersResponse : Group members in the given service group.
  """
  client = _GetClientInstance(_V2BETA_VERSION)
  messages = client.MESSAGES_MODULE

  request = messages.ServiceusageServicesGroupsMembersListRequest(
      parent=resource + '/' + service_group
  )

  try:
    response = list_pager.YieldFromList(
        _Lister(client.services_groups_members),
        request,
        limit=limit,
        batch_size_attribute='pageSize',
        batch_size=page_size,
        field='memberStates',
    )
    member_states = []
    for member_state in response:
      member_states.append(member_state)
    return member_states
  except (
      apitools_exceptions.HttpBadRequestError,
      apitools_exceptions.HttpForbiddenError,
      apitools_exceptions.HttpNotFoundError,
  ) as e:
    exceptions.ReraiseError(e, exceptions.ListGroupMembersException)


def ListDescendantServices(
    resource: str, service_group: str, page_size: int = 50
):
  """Make API call to list descendant services of a specific service group.

  Args:
    resource: The target resource in the format:
      '{resource_type}/{resource_name}'.
    service_group: Service group, for example,
      'services/compute.googleapis.com/groups/dependencies'.
    page_size: The page size to list. The default page_size is 50.

  Raises:
    exceptions.ListDescendantServicesPermissionDeniedException: when listing
      descendant services fails.
    apitools_exceptions.HttpError: Another miscellaneous error with the service.

  Returns:
    Descendant services in the given service group.
  """
  client = _GetClientInstance('v2alpha')
  messages = client.MESSAGES_MODULE

  request = messages.ServiceusageServicesGroupsDescendantServicesListRequest(
      parent='{}/{}'.format(resource, service_group)
  )

  try:
    return list_pager.YieldFromList(
        _Lister(client.services_groups_descendantServices),
        request,
        batch_size_attribute='pageSize',
        batch_size=page_size,
        field='services',
    )
  except (
      apitools_exceptions.HttpForbiddenError,
      apitools_exceptions.HttpNotFoundError,
  ) as e:
    exceptions.ReraiseError(e, exceptions.ListDescendantServicesException)


def ListExpandedMembers(resource: str, service_group: str, page_size: int = 50):
  """Make API call to list expanded members of a specific service group.

  Args:
    resource: The target resource in the format:
      '{resource_type}/{resource_name}'.
    service_group: Service group, for example,
      'services/compute.googleapis.com/groups/dependencies'.
    page_size: The page size to list. The default page_size is 50.

  Raises:
    exceptions.ListExpandedMembersException: when listing
      expanded members fails.
    apitools_exceptions.HttpError: Another miscellaneous error with the service.

  Returns:
    Message. ExpandedMember.serviceName : Service names of the expanded members
    of the service group.
  """
  client = _GetClientInstance(_V2BETA_VERSION)
  messages = client.MESSAGES_MODULE

  request = messages.ServiceusageServicesGroupsExpandedMembersListRequest(
      parent='{}/{}'.format(resource, service_group)
  )

  try:
    response = list_pager.YieldFromList(
        _Lister(client.services_groups_expandedMembers),
        request,
        batch_size_attribute='pageSize',
        batch_size=page_size,
        field='members',
    )
    service_names = []
    for member in response:
      service_names.append(member.serviceName)
    return service_names
  except (
      apitools_exceptions.HttpForbiddenError,
      apitools_exceptions.HttpNotFoundError,
  ) as e:
    exceptions.ReraiseError(e, exceptions.ListExpandedMembersException)


def ListAncestorGroups(resource: str, service: str, page_size: int = 50):
  """Make API call to list ancestor groups that depend on the service.

  Args:
    resource: The target resource.format : '{resource_type}/{resource_name}'.
    service: The identifier of the service to get ancestor groups of, for
      example, 'services/compute.googleapis.com'.
    page_size: The page size to list.The default page_size is 50.

  Raises:
    exceptions.ListAncestorGroupsPermissionDeniedException: when listing
      ancestor group fails.
    apitools_exceptions.HttpError: Another miscellaneous error with the service.

  Returns:
    Ancestor groups that depend on the service.
  """
  client = _GetClientInstance('v2alpha')
  messages = client.MESSAGES_MODULE

  request = messages.ServiceusageServicesAncestorGroupsListRequest(
      name=f'{resource}/{service}'
  )

  try:
    return list_pager.YieldFromList(
        _Lister(client.services_ancestorGroups),
        request,
        batch_size_attribute='pageSize',
        batch_size=page_size,
        field='groups',
    )
  except (
      apitools_exceptions.HttpForbiddenError,
      apitools_exceptions.HttpNotFoundError,
  ) as e:
    exceptions.ReraiseError(
        e, exceptions.ListAncestorGroupsPermissionDeniedException
    )


def AnalyzeConsumerPolicy(
    proposed_policy,
):
  """Make API call to analyze a consumer policy for dependencies.

  Args:
    proposed_policy: The consumer policy to analyze. type :
      message.GoogleApiServiceusageV2alphaConsumerPolicy

  Raises:
    exceptions.AnalyzeConsumerPolicyException: when analyzing a
      consumer policy fails.
    apitools_exceptions.HttpError: Another miscellaneous error with the service.

  Returns:
    message.
  """
  client = _GetClientInstance(version=_V2BETA_VERSION)
  messages = client.MESSAGES_MODULE

  request = messages.ServiceusageConsumerPoliciesAnalyzeRequest(
      analyzeConsumerPolicyRequest=messages.AnalyzeConsumerPolicyRequest(
          proposedPolicy=proposed_policy,
          analysisTypes=[
              messages.AnalyzeConsumerPolicyRequest.AnalysisTypesValueListEntryValuesEnum.ANALYSIS_TYPE_DEPENDENCY,
          ],
      ),
      name=proposed_policy.name,
  )
  try:
    return client.consumerPolicies.Analyze(request)
  except (
      apitools_exceptions.HttpForbiddenError,
      apitools_exceptions.HttpNotFoundError,
  ) as e:
    exceptions.ReraiseError(e, exceptions.AnalyzeConsumerPolicyException)


def AddEnableRule(
    services: List[str],
    project: str,
    consumer_policy_name: str = 'default',
    folder: str = None,
    organization: str = None,
    validate_only: bool = False,
    skip_dependency: bool = False,
):
  """Make API call to enable a specific service.

  Args:
    services: The identifier of the service to enable, for example
      'serviceusage.googleapis.com'.
    project: The project for which to enable the service.
    consumer_policy_name: Name of consumer policy. The default name is
      "default".
    folder: The folder for which to enable the service.
    organization: The organization for which to enable the service.
    validate_only: If True, the action will be validated and result will be
      preview but not exceuted.
    skip_dependency: If True, the dependencies of the service to be enabled will
      not be enabled.

  Raises:
    exceptions.EnableServiceException: when enabling API fails.
    apitools_exceptions.HttpError: Another miscellaneous error with the service.

  Returns:
    The result of the operation
  """
  client = _GetClientInstance(version=_V2BETA_VERSION)
  messages = client.MESSAGES_MODULE

  resource_name = _PROJECT_RESOURCE % project

  if folder:
    resource_name = _FOLDER_RESOURCE % folder

  if organization:
    resource_name = _ORGANIZATION_RESOURCE % organization

  policy_name = resource_name + _CONSUMER_POLICY_DEFAULT % consumer_policy_name

  try:
    policy = GetConsumerPolicyV2Beta(policy_name)

    services_to_enabled = set()

    if policy.enableRules:
      enabled_services = set(policy.enableRules[0].services)
      for service in services:
        # Check if services to add is not already present in the policy.
        if _SERVICE_RESOURCE % service not in enabled_services:
          services_to_enabled.add(_SERVICE_RESOURCE % service)
    else:
      for service in services:
        services_to_enabled.add(_SERVICE_RESOURCE % service)

    if not services_to_enabled:
      raise exceptions.ConfigError(
          'The service(s) '
          + ','.join(services)
          + ' are already enabled and present in the consumer policy'
      )

    if not skip_dependency:
      dependent_services = []
      for service in services_to_enabled:
        list_expanded_members = ListExpandedMembers(
            resource_name, service + _DEPENDENCY_GROUP
        )
        for dependent_service in list_expanded_members:
          # dependent_service is in format services/{service_name}
          dependent_services.append(dependent_service)

      for service in dependent_services:
        services_to_enabled.add(service)

    if policy.enableRules:
      for service in list(services_to_enabled):
        # check if dependent services are already enabled
        if service not in policy.enableRules[0].services:
          policy.enableRules[0].services.append(service)
    else:
      policy.enableRules.append(
          messages.GoogleApiServiceusageV2betaEnableRule(
              services=list(services_to_enabled)
          )
      )

    return UpdateConsumerPolicyV2Beta(
        policy, policy_name, validateonly=validate_only
    )
  except (
      apitools_exceptions.HttpForbiddenError,
      apitools_exceptions.HttpNotFoundError,
  ) as e:
    exceptions.ReraiseError(e, exceptions.EnableServiceException)


def RemoveEnableRule(
    project: str,
    service: str,
    consumer_policy_name: str = 'default',
    force: bool = False,
    folder: str = None,
    organization: str = None,
    validate_only: bool = False,
):
  """Make API call to disable a specific service.

  Args:
    project: The project for which to disable the service.
    service: The identifier of the service to disable, for example
      'serviceusage.googleapis.com'.
    consumer_policy_name: Name of consumer policy. The default name is
      "default".
    force: Disable service with usage within last 30 days or disable recently
      enabled service or disable the service even if there are enabled services
      which depend on it. This also disables the services which depend on the
      service to be disabled.
    folder: The folder for which to disable the service.
    organization: The organization for which to disable the service.
    validate_only: If True, the action will be validated and result will be
      preview but not exceuted.`

  Raises:
    exceptions.EnableServiceException: when disabling API fails.
    apitools_exceptions.HttpError: Another miscellaneous error with the service.

  Returns:
    The result of the operation
  """
  resource_name = _PROJECT_RESOURCE % project

  if folder:
    resource_name = _FOLDER_RESOURCE % folder

  if organization:
    resource_name = _ORGANIZATION_RESOURCE % organization

  policy_name = resource_name + _CONSUMER_POLICY_DEFAULT % consumer_policy_name

  try:
    current_policy = GetConsumerPolicyV2Beta(policy_name)

    service_is_enabled = False

    for enable_rule in current_policy.enableRules:
      if _SERVICE_RESOURCE % service in enable_rule.services:
        service_is_enabled = True
        break

    if not service_is_enabled:
      raise exceptions.ConfigError(
          'The service ' + service + ' is not enabled.'
      )

    proposed_policy = copy.deepcopy(current_policy)
    for enable_rule in proposed_policy.enableRules:
      if _SERVICE_RESOURCE % service in enable_rule.services:
        enable_rule.services.remove(_SERVICE_RESOURCE % service)

    op = AnalyzeConsumerPolicy(proposed_policy)

    op = services_util.WaitOperation(op.name, GetOperationV2Beta)

    analysis_reponse = encoding.MessageToDict(op.response)

    to_remove = []

    if 'analysis' in analysis_reponse:
      for analysis in analysis_reponse['analysis']:
        for warning in analysis['analysisResult']['warnings']:
          ## check if analysis is related to service to be removed.
          if _SERVICE_RESOURCE % service in warning['detail']:
            to_remove.append(analysis['service'])

    if not force and to_remove:
      to_remove = ','.join(to_remove)
      raise exceptions.ConfigError(
          'The service '
          + service
          + ' is depended on by the following active service(s) '
          + to_remove
          + ' . Provide the --force flag if you wish to force disable services.'
      )

    to_remove = set(to_remove)

    updated_consumer_poicy = copy.deepcopy(proposed_policy)
    updated_consumer_poicy.enableRules.clear()

    for enable_rule in proposed_policy.enableRules:
      rule = copy.deepcopy(enable_rule)
      for service_name in enable_rule.services:
        if service_name in to_remove:
          rule.services.remove(service_name)
      if rule.services:
        updated_consumer_poicy.enableRules.append(rule)

    return UpdateConsumerPolicyV2Beta(
        updated_consumer_poicy,
        policy_name,
        force=force,
        validateonly=validate_only,
    )
  except (
      apitools_exceptions.HttpForbiddenError,
      apitools_exceptions.HttpNotFoundError,
  ) as e:
    exceptions.ReraiseError(e, exceptions.EnableServiceException)
  except apitools_exceptions.HttpBadRequestError as e:
    log.status.Print(
        'Provide the --force flag if you wish to force disable services.'
    )
    exceptions.ReraiseError(e, exceptions.Error)


def EnableApiCall(project, service):
  """Make API call to enable a specific service.

  Args:
    project: The project for which to enable the service.
    service: The identifier of the service to enable, for example
      'serviceusage.googleapis.com'.

  Raises:
    exceptions.EnableServiceException: when enabling API fails.
    apitools_exceptions.HttpError: Another miscellaneous error with the service.

  Returns:
    The result of the operation
  """
  client = _GetClientInstance()
  messages = client.MESSAGES_MODULE

  request = messages.ServiceusageServicesEnableRequest(
      name=_PROJECT_SERVICE_RESOURCE % (project, service))
  try:
    return client.services.Enable(request)
  except (apitools_exceptions.HttpForbiddenError,
          apitools_exceptions.HttpNotFoundError) as e:
    exceptions.ReraiseError(e, exceptions.EnableServiceException)


def BatchEnableApiCall(project, services):
  """Make API call to batch enable services.

  Args:
    project: The project for which to enable the services.
    services: Iterable of identifiers of services to enable.

  Raises:
    exceptions.EnableServiceException: when enabling API fails.
    apitools_exceptions.HttpError: Another miscellaneous error with the service.

  Returns:
    The result of the operation
  """
  client = _GetClientInstance()
  messages = client.MESSAGES_MODULE

  request = messages.ServiceusageServicesBatchEnableRequest(
      batchEnableServicesRequest=messages.BatchEnableServicesRequest(
          serviceIds=services),
      parent=_PROJECT_RESOURCE % project)
  try:
    return client.services.BatchEnable(request)
  except (apitools_exceptions.HttpForbiddenError,
          apitools_exceptions.HttpNotFoundError) as e:
    exceptions.ReraiseError(e, exceptions.EnableServiceException)


def DisableApiCall(project, service, force=False):
  """Make API call to disable a specific service.

  Args:
    project: The project for which to enable the service.
    service: The identifier of the service to disable, for example
      'serviceusage.googleapis.com'.
    force: disable the service even if there are enabled services which depend
      on it. This also disables the services which depend on the service to be
      disabled.

  Raises:
    exceptions.EnableServiceException: when disabling API fails.
    apitools_exceptions.HttpError: Another miscellaneous error with the service.

  Returns:
    The result of the operation
  """
  client = _GetClientInstance()
  messages = client.MESSAGES_MODULE

  check = messages.DisableServiceRequest.CheckIfServiceHasUsageValueValuesEnum.CHECK
  if force:
    check = messages.DisableServiceRequest.CheckIfServiceHasUsageValueValuesEnum.SKIP
  request = messages.ServiceusageServicesDisableRequest(
      name=_PROJECT_SERVICE_RESOURCE % (project, service),
      disableServiceRequest=messages.DisableServiceRequest(
          disableDependentServices=force,
          checkIfServiceHasUsage=check,
      ),
  )
  try:
    return client.services.Disable(request)
  except (apitools_exceptions.HttpForbiddenError,
          apitools_exceptions.HttpNotFoundError) as e:
    exceptions.ReraiseError(e, exceptions.EnableServiceException)
  except apitools_exceptions.HttpBadRequestError as e:
    log.status.Print('Provide the --force flag if you wish to force disable '
                     'services.')
    exceptions.ReraiseError(e, exceptions.Error)


def GetService(project, service):
  """Get a service.

  Args:
    project: The project for which to get the service.
    service: The service to get.

  Raises:
    exceptions.GetServicePermissionDeniedException: when getting service fails.
    apitools_exceptions.HttpError: Another miscellaneous error with the service.

  Returns:
    The service configuration.
  """
  client = _GetClientInstance()
  messages = client.MESSAGES_MODULE

  request = messages.ServiceusageServicesGetRequest(
      name=_PROJECT_SERVICE_RESOURCE % (project, service))
  try:
    return client.services.Get(request)
  except (apitools_exceptions.HttpForbiddenError,
          apitools_exceptions.HttpNotFoundError) as e:
    exceptions.ReraiseError(e, exceptions.GetServicePermissionDeniedException)


def IsServiceEnabled(service):
  client = _GetClientInstance()
  messages = client.MESSAGES_MODULE
  return service.state == messages.GoogleApiServiceusageV1Service.StateValueValuesEnum.ENABLED


class _Lister:

  def __init__(self, service_usage):
    self.service_usage = service_usage

  @http_retry.RetryOnHttpStatus(_TOO_MANY_REQUESTS)
  def List(self, request, global_params=None):
    return self.service_usage.List(request, global_params=global_params)


def ListServicesV2Beta(
    project: str,
    enabled: bool,
    page_size: int,
    limit=sys.maxsize,
    folder: str = None,
    organization: str = None,
):
  """Make API call to list services.

  Args:
    project: The project for which to list services.
    enabled: List only enabled services.
    page_size: The page size to list.
    limit: The max number of services to display.
    folder: The folder for which to list services.
    organization: The organization for which to list services.

  Raises:
    exceptions.ListServicesException: when listing services
    fails.
    apitools_exceptions.HttpError: Another miscellaneous error with the service.

  Returns:
    The list of services
  """
  resource_name = _PROJECT_RESOURCE % project
  if folder:
    resource_name = _FOLDER_RESOURCE % folder

  if organization:
    resource_name = _ORGANIZATION_RESOURCE % organization

  services = {}
  parent = []
  try:
    if enabled:
      policy_name = resource_name + _EFFECTIVE_POLICY
      effectivepolicy = GetEffectivePolicyV2Beta(policy_name)

      for rules in effectivepolicy.enableRules:
        for value in rules.services:
          if limit == 0:
            break
          parent.append(f'{resource_name}/{value}')
          services[value] = ''
          limit -= 1

      for value in range(0, len(parent), 20):
        response = BatchGetService(resource_name, parent[value : value + 20])
        for service_state in response.services:
          service_name = '/'.join(service_state.name.split('/')[2:])
          services[service_name] = service_state.service.displayName

    else:
      for category_service in ListCategoryServices(
          resource_name, _GOOGLE_CATEGORY_RESOURCE, page_size, limit
      ):
        services[category_service.service.name] = (
            category_service.service.displayName
        )

    result = []
    service_info = collections.namedtuple('ServiceList', ['name', 'title'])
    for service in services:
      result.append(service_info(name=service, title=services[service]))

    return result
  except (
      apitools_exceptions.HttpForbiddenError,
      apitools_exceptions.HttpNotFoundError,
  ) as e:
    exceptions.ReraiseError(e, exceptions.ListServicesException)


def ListServices(project, enabled, page_size, limit):
  """Make API call to list services.

  Args:
    project: The project for which to list services.
    enabled: List only enabled services.
    page_size: The page size to list.
    limit: The max number of services to display.

  Raises:
    exceptions.ListServicesException: when listing services
    fails.
    apitools_exceptions.HttpError: Another miscellaneous error with the service.

  Returns:
    The list of services
  """
  client = _GetClientInstance()
  messages = client.MESSAGES_MODULE

  if enabled:
    service_filter = 'state:ENABLED'
  else:
    service_filter = None
  request = messages.ServiceusageServicesListRequest(
      filter=service_filter, parent=_PROJECT_RESOURCE % project)
  try:
    return list_pager.YieldFromList(
        _Lister(client.services),
        request,
        limit=limit,
        batch_size_attribute='pageSize',
        batch_size=page_size,
        field='services')
  except (apitools_exceptions.HttpForbiddenError,
          apitools_exceptions.HttpNotFoundError) as e:
    exceptions.ReraiseError(e, exceptions.ListServicesException)


def GetOperation(name: str):
  """Make API call to get an operation using serviceusageV1 api.

  Args:
    name: The name of operation.

  Raises:
    exceptions.OperationErrorException: when the getting operation API fails.
    apitools_exceptions.HttpError: Another miscellaneous error with the service.

  Returns:
    The result of the operation
  """
  client = _GetClientInstance()
  messages = client.MESSAGES_MODULE
  request = messages.ServiceusageOperationsGetRequest(name=name)
  try:
    return client.operations.Get(request)
  except (apitools_exceptions.HttpForbiddenError,
          apitools_exceptions.HttpNotFoundError) as e:
    exceptions.ReraiseError(e, exceptions.OperationErrorException)


def GetOperationV2Alpha(name: str):
  """Make API call to get an operation using serviceusageV2alpha api.

  Args:
    name: The name of the operation resource. Format
      'operations/<operation_id>'.

  Raises:
    exceptions.OperationErrorException: when the getting operation API fails.
    apitools_exceptions.HttpError: Another miscellaneous error with the service.

  Returns:
    The message.Operation object with response and error.
  """
  client = _GetClientInstance('v2alpha')
  messages = client.MESSAGES_MODULE
  request = messages.ServiceusageOperationsGetRequest(name=name)
  try:
    return client.operations.Get(request)
  except (
      apitools_exceptions.HttpForbiddenError,
      apitools_exceptions.HttpNotFoundError,
  ) as e:
    exceptions.ReraiseError(e, exceptions.OperationErrorException)


def GetOperationV2Beta(name: str):
  """Make API call to get an operation using serviceusageV2beta api.

  Args:
    name: The name of the operation resource. Format
      'operations/<operation_id>'.

  Raises:
    exceptions.OperationErrorException: when the getting operation API fails.
    apitools_exceptions.HttpError: Another miscellaneous error with the service.

  Returns:
    The message.Operation object with response and error.
  """
  client = _GetClientInstance(version=_V2BETA_VERSION)
  messages = client.MESSAGES_MODULE
  request = messages.ServiceusageOperationsGetRequest(name=name)
  try:
    return client.operations.Get(request)
  except (
      apitools_exceptions.HttpForbiddenError,
      apitools_exceptions.HttpNotFoundError,
  ) as e:
    exceptions.ReraiseError(e, exceptions.OperationErrorException)


def GenerateServiceIdentity(
    container, service, container_type=ContainerType.PROJECT_SERVICE_RESOURCE
):
  """Generate a service identity.

  Args:
    container: The container to generate a service identity for.
    service: The service to generate a service identity for.
    container_type: The type of container, default to be project.

  Raises:
    exceptions.GenerateServiceIdentityPermissionDeniedException: when generating
    service identity fails.
    apitools_exceptions.HttpError: Another miscellaneous error with the service.

  Returns:
    A dict with the email and uniqueId of the generated service identity. If
    service does not have a default identity, the response will be an empty
    dictionary.
  """
  client = _GetClientInstance(version=_V1BETA1_VERSION)
  messages = client.MESSAGES_MODULE

  if container_type == ContainerType.PROJECT_SERVICE_RESOURCE:
    parent = _PROJECT_SERVICE_RESOURCE % (container, service)
  elif container_type == ContainerType.FOLDER_SERVICE_RESOURCE:
    parent = _FOLDER_SERVICE_RESOURCE % (container, service)
  elif container_type == ContainerType.ORG_SERVICE_RESOURCE:
    parent = _ORG_SERVICE_RESOURCE % (container, service)
  else:
    raise ValueError('Invalid container type specified.')
  request = messages.ServiceusageServicesGenerateServiceIdentityRequest(
      parent=parent
  )
  try:
    op = client.services.GenerateServiceIdentity(request)
    response = encoding.MessageToDict(op.response)
    # Only keep email and uniqueId from the response.
    # If the response doesn't contain these keys, the returned dictionary will
    # not contain them either.
    return {k: response[k] for k in ('email', 'uniqueId') if k in response}
  except (apitools_exceptions.HttpForbiddenError,
          apitools_exceptions.HttpNotFoundError) as e:
    exceptions.ReraiseError(
        e, exceptions.GenerateServiceIdentityPermissionDeniedException)


def ListQuotaMetrics(consumer, service, page_size=None, limit=None):
  """List service quota metrics for a consumer.

  Args:
    consumer: The consumer to list metrics for, e.g. "projects/123".
    service: The service to list metrics for.
    page_size: The page size to list.
    limit: The max number of metrics to return.

  Raises:
    exceptions.PermissionDeniedException: when listing metrics fails.
    apitools_exceptions.HttpError: Another miscellaneous error with the service.

  Returns:
    The list of quota metrics
  """
  _ValidateConsumer(consumer)
  client = _GetClientInstance(version=_V1BETA1_VERSION)
  messages = client.MESSAGES_MODULE

  request = messages.ServiceusageServicesConsumerQuotaMetricsListRequest(
      parent=_CONSUMER_SERVICE_RESOURCE % (consumer, service))
  return list_pager.YieldFromList(
      client.services_consumerQuotaMetrics,
      request,
      limit=limit,
      batch_size_attribute='pageSize',
      batch_size=page_size,
      field='metrics')


def UpdateQuotaOverrideCall(consumer,
                            service,
                            metric,
                            unit,
                            dimensions,
                            value,
                            force=False):
  """Update a quota override.

  Args:
    consumer: The consumer to update a quota override for, e.g. "projects/123".
    service: The service to update a quota override for.
    metric: The quota metric name.
    unit: The unit of quota metric.
    dimensions: The dimensions of the override in dictionary format. It can be
      None.
    value: The override integer value.
    force: Force override update even if the change results in a substantial
      decrease in available quota.

  Raises:
    exceptions.UpdateQuotaOverridePermissionDeniedException: when updating an
    override fails.
    apitools_exceptions.HttpError: Another miscellaneous error with the service.

  Returns:
    The quota override operation.
  """
  _ValidateConsumer(consumer)
  client = _GetClientInstance(version=_V1BETA1_VERSION)
  messages = client.MESSAGES_MODULE

  dimensions_message = _GetDimensions(messages, dimensions)
  request = messages.ServiceusageServicesConsumerQuotaMetricsImportConsumerOverridesRequest(
      parent=_CONSUMER_SERVICE_RESOURCE % (consumer, service),
      importConsumerOverridesRequest=messages.ImportConsumerOverridesRequest(
          inlineSource=messages.OverrideInlineSource(
              overrides=[
                  messages.QuotaOverride(
                      metric=metric,
                      unit=unit,
                      overrideValue=value,
                      dimensions=dimensions_message)
              ],),
          force=force),
  )
  try:
    return client.services_consumerQuotaMetrics.ImportConsumerOverrides(request)
  except (apitools_exceptions.HttpForbiddenError,
          apitools_exceptions.HttpNotFoundError) as e:
    exceptions.ReraiseError(
        e, exceptions.UpdateQuotaOverridePermissionDeniedException)


def DeleteQuotaOverrideCall(consumer,
                            service,
                            metric,
                            unit,
                            override_id,
                            force=False):
  """Delete a quota override.

  Args:
    consumer: The consumer to delete a quota override for, e.g. "projects/123".
    service: The service to delete a quota aoverride for.
    metric: The quota metric name.
    unit: The unit of quota metric.
    override_id: The override ID.
    force: Force override deletion even if the change results in a substantial
      decrease in available quota.

  Raises:
    exceptions.DeleteQuotaOverridePermissionDeniedException: when deleting an
    override fails.
    apitools_exceptions.HttpError: Another miscellaneous error with the service.

  Returns:
    The quota override operation.
  """
  _ValidateConsumer(consumer)
  client = _GetClientInstance(version=_V1BETA1_VERSION)
  messages = client.MESSAGES_MODULE

  parent = _GetMetricResourceName(consumer, service, metric, unit)
  name = _LIMIT_OVERRIDE_RESOURCE % (parent, override_id)
  request = messages.ServiceusageServicesConsumerQuotaMetricsLimitsConsumerOverridesDeleteRequest(
      name=name,
      force=force,
  )
  try:
    return client.services_consumerQuotaMetrics_limits_consumerOverrides.Delete(
        request)
  except (apitools_exceptions.HttpForbiddenError,
          apitools_exceptions.HttpNotFoundError) as e:
    exceptions.ReraiseError(
        e, exceptions.DeleteQuotaOverridePermissionDeniedException)


def _GetDimensions(messages, dimensions):
  if dimensions is None:
    return None
  dt = messages.QuotaOverride.DimensionsValue
  # sorted by key strings to maintain the unit test behavior consistency.
  return dt(
      additionalProperties=[
          dt.AdditionalProperty(key=k, value=dimensions[k])
          for k in sorted(dimensions.keys())
      ],)


def _GetMetricResourceName(consumer, service, metric, unit):
  """Get the metric resource name from metric name and unit.

  Args:
    consumer: The consumer to manage an override for, e.g. "projects/123".
    service: The service to manage an override for.
    metric: The quota metric name.
    unit: The unit of quota metric.

  Raises:
    exceptions.Error: when the limit with given metric and unit is not found.

  Returns:
    The quota override operation.
  """
  metrics = ListQuotaMetrics(consumer, service)
  for m in metrics:
    if m.metric == metric:
      for q in m.consumerQuotaLimits:
        if q.unit == unit:
          return q.name
  raise exceptions.Error('limit not found with name "%s" and unit "%s".' %
                         (metric, unit))


def _ValidateConsumer(consumer):
  for prefix in _VALID_CONSUMER_PREFIX:
    if consumer.startswith(prefix):
      return
  raise exceptions.Error('invalid consumer format "%s".' % consumer)


def _GetClientInstance(version='v1'):
  """Get a client instance for service usage."""
  # pylint:disable=protected-access
  # Specifically disable resource quota in all cases for service management.
  # We need to use this API to turn on APIs and sometimes the user doesn't have
  # this API turned on. We should always use the shared project to do this
  # so we can bootstrap users getting the appropriate APIs enabled. If the user
  # has explicitly set the quota project, then respect that.
  # pylint: disable=g-import-not-at-top
  from googlecloudsdk.core.credentials import transports
  # pylint: enable=g-import-not-at-top
  enable_resource_quota = (
      properties.VALUES.billing.quota_project.IsExplicitlySet())
  http_client = transports.GetApitoolsTransport(
      response_encoding=transport.ENCODING,
      enable_resource_quota=enable_resource_quota)
  return apis_internal._GetClientInstance(
      'serviceusage', version, http_client=http_client)

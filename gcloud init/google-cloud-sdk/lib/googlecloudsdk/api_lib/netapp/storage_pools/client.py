# -*- coding: utf-8 -*- #
# Copyright 2022 Google LLC. All Rights Reserved.
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
"""Commands for interacting with the Cloud NetApp Files Storage Pool API resource."""

from __future__ import absolute_import
from __future__ import division
from __future__ import unicode_literals

from apitools.base.py import list_pager
from googlecloudsdk.api_lib.netapp import constants
from googlecloudsdk.api_lib.netapp import util as netapp_api_util
from googlecloudsdk.api_lib.util import waiter
from googlecloudsdk.calliope import base
from googlecloudsdk.core import log
from googlecloudsdk.core import resources


class StoragePoolsClient(object):
  """Wrapper for working with Storage Pool in the Cloud NetApp Files API Client.
  """

  def __init__(self, release_track=base.ReleaseTrack.ALPHA):
    self.release_track = release_track
    if self.release_track == base.ReleaseTrack.ALPHA:
      self._adapter = AlphaStoragePoolsAdapter()
    elif self.release_track == base.ReleaseTrack.BETA:
      self._adapter = BetaStoragePoolsAdapter()
    elif self.release_track == base.ReleaseTrack.GA:
      self._adapter = StoragePoolsAdapter()
    else:
      raise ValueError('[{}] is not a valid API version.'.format(
          netapp_api_util.VERSION_MAP[release_track]))

  @property
  def client(self):
    return self._adapter.client

  @property
  def messages(self):
    return self._adapter.messages

  def WaitForOperation(self, operation_ref):
    """Waits on the long-running operation until the done field is True.

    Args:
      operation_ref: the operation reference.

    Raises:
      waiter.OperationError: if the operation contains an error.

    Returns:
      the 'response' field of the Operation.
    """
    return waiter.WaitFor(
        waiter.CloudOperationPollerNoResources(
            self.client.projects_locations_operations), operation_ref,
        'Waiting for [{0}] to finish'.format(operation_ref.Name()))

  def CreateStoragePool(self, storagepool_ref, async_, config):
    """Create a Cloud NetApp Storage Pool."""
    request = self.messages.NetappProjectsLocationsStoragePoolsCreateRequest(
        parent=storagepool_ref.Parent().RelativeName(),
        storagePoolId=storagepool_ref.Name(),
        storagePool=config)
    create_op = self.client.projects_locations_storagePools.Create(request)
    if async_:
      return create_op
    operation_ref = resources.REGISTRY.ParseRelativeName(
        create_op.name, collection=constants.OPERATIONS_COLLECTION)
    return self.WaitForOperation(operation_ref)

  def ParseStoragePoolConfig(self,
                             name=None,
                             service_level=None,
                             network=None,
                             active_directory=None,
                             kms_config=None,
                             enable_ldap=None,
                             capacity=None,
                             description=None,
                             allow_auto_tiering=None,
                             zone=None,
                             replica_zone=None,
                             custom_performance_enabled=None,
                             total_throughput=None,
                             total_iops=None,
                             hot_tier_size=None,
                             enable_hot_tier_auto_resize=None,
                             labels=None,
                             unified_pool=None):
    """Parses the command line arguments for Create Storage Pool into a config."""
    return self._adapter.ParseStoragePoolConfig(
        name=name,
        service_level=service_level,
        network=network,
        kms_config=kms_config,
        active_directory=active_directory,
        enable_ldap=enable_ldap,
        capacity=capacity,
        description=description,
        allow_auto_tiering=allow_auto_tiering,
        zone=zone,
        replica_zone=replica_zone,
        custom_performance_enabled=custom_performance_enabled,
        total_throughput=total_throughput,
        total_iops=total_iops,
        hot_tier_size=hot_tier_size,
        enable_hot_tier_auto_resize=enable_hot_tier_auto_resize,
        labels=labels,
        unified_pool=unified_pool,
    )

  def ListStoragePools(self, location_ref, limit=None):
    """Make API calls to List active Cloud NetApp Storage Pools.

    Args:
      location_ref: The parsed location of the listed NetApp Volumes.
      limit: The number of Cloud NetApp Storage Pools to limit the results to.
        This limit is passed to the server and the server does the limiting.

    Returns:
      Generator that yields the Cloud NetApp Volumes.
    """
    request = self.messages.NetappProjectsLocationsStoragePoolsListRequest(
        parent=location_ref)
    # Check for unreachable locations.
    response = self.client.projects_locations_storagePools.List(request)
    for location in response.unreachable:
      log.warning('Location {} may be unreachable.'.format(location))
    return list_pager.YieldFromList(
        self.client.projects_locations_storagePools,
        request,
        field=constants.STORAGE_POOL_RESOURCE,
        limit=limit,
        batch_size_attribute='pageSize')

  def GetStoragePool(self, storagepool_ref):
    """Get Cloud NetApp Storage Pool information."""
    request = self.messages.NetappProjectsLocationsStoragePoolsGetRequest(
        name=storagepool_ref.RelativeName())
    return self.client.projects_locations_storagePools.Get(request)

  def DeleteStoragePool(self, storagepool_ref, async_):
    """Deletes an existing Cloud NetApp Storage Pool."""
    request = self.messages.NetappProjectsLocationsStoragePoolsDeleteRequest(
        name=storagepool_ref.RelativeName())
    return self._DeleteStoragePool(async_, request)

  def _DeleteStoragePool(self, async_, request):
    delete_op = self.client.projects_locations_storagePools.Delete(request)
    if async_:
      return delete_op
    operation_ref = resources.REGISTRY.ParseRelativeName(
        delete_op.name, collection=constants.OPERATIONS_COLLECTION)
    return self.WaitForOperation(operation_ref)

  def ParseUpdatedStoragePoolConfig(self,
                                    storagepool_config,
                                    capacity=None,
                                    active_directory=None,
                                    description=None,
                                    allow_auto_tiering=None,
                                    zone=None,
                                    replica_zone=None,
                                    total_throughput=None,
                                    total_iops=None,
                                    hot_tier_size=None,
                                    enable_hot_tier_auto_resize=None,
                                    labels=None):
    """Parses updates into a storage pool config.

    Args:
      storagepool_config: The storage pool message to update.
      capacity: capacity of a storage pool
      active_directory: the Active Directory attached to a storage pool
      description: str, a new description, if any.
      allow_auto_tiering: bool indicate whether pool supports auto-tiering
      zone: str, zone for storage pool
      replica_zone: str, replica zone for storage pool
      total_throughput: int, total throughput of the storage pool
      total_iops: int, total IOPS of the storage pool
      hot_tier_size: int, hot tier size of the storage pool
      enable_hot_tier_auto_resize: bool, whether hot tier auto resize is enabled
      for the storage pool
      labels: LabelsValue message, the new labels value, if any.

    Returns:
      The storage pool message.
    """
    storage_pool = self._adapter.ParseUpdatedStoragePoolConfig(
        storagepool_config,
        capacity=capacity,
        active_directory=active_directory,
        description=description,
        allow_auto_tiering=allow_auto_tiering,
        zone=zone,
        replica_zone=replica_zone,
        total_throughput=total_throughput,
        total_iops=total_iops,
        hot_tier_size=hot_tier_size,
        enable_hot_tier_auto_resize=enable_hot_tier_auto_resize,
        labels=labels
    )
    return storage_pool

  def UpdateStoragePool(
      self, storagepool_ref, storagepool_config, update_mask, async_
  ):
    """Updates a Storage Pool.

    Args:
      storagepool_ref: the reference to the storage pool.
      storagepool_config: Storage Pool message, the updated storage pool.
      update_mask: str, a comma-separated list of updated fields.
      async_: bool, if False, wait for the operation to complete.

    Returns:
      an Operation or Storage Pool message.
    """
    update_op = self._adapter.UpdateStoragePool(storagepool_ref,
                                                storagepool_config, update_mask)
    if async_:
      return update_op
    operation_ref = resources.REGISTRY.ParseRelativeName(
        update_op.name, collection=constants.OPERATIONS_COLLECTION)
    return self.WaitForOperation(operation_ref)

  def SwitchStoragePool(self, storagepool_ref, async_):
    """Switch the zone of a Regional Cloud NetApp Storage Pooln.

    Args:
      storagepool_ref: the reference to the storage pool.
      async_: bool, if False, wait for the operation to complete.

    Returns:
      an Operation if async_ is set to true, or a switch message if the
      SwtichStoragePool is successful.
    """
    switch_op = self._adapter.SwitchStoragePool(storagepool_ref)
    if async_:
      return switch_op
    operation_ref = resources.REGISTRY.ParseRelativeName(
        switch_op.name, collection=constants.OPERATIONS_COLLECTION
    )
    return self.WaitForOperation(operation_ref)

  def ValidateDirectoryService(self, storagepool_ref, directory_service_type,
                               async_):
    """Validates the directory service attached to the storage pool.

    Args:
      storagepool_ref: the reference to the storage pool.
      directory_service_type: the type of directory service to validate.
      async_: bool, if False, wait for the operation to complete.

    Returns:
      an Operation if async_ is set to true, or a validate message if the
      validation is successful.
    """
    validate_op = self._adapter.ValidateDirectoryService(
        storagepool_ref, directory_service_type
    )
    if async_:
      return validate_op
    operation_ref = resources.REGISTRY.ParseRelativeName(
        validate_op.name, collection=constants.OPERATIONS_COLLECTION
    )
    return self.WaitForOperation(operation_ref)


class StoragePoolsAdapter(object):
  """Adapter for the Cloud NetApp Files API for Storage Pools."""

  def __init__(self):
    self.release_track = base.ReleaseTrack.GA
    self.client = netapp_api_util.GetClientInstance(
        release_track=self.release_track
    )
    self.messages = netapp_api_util.GetMessagesModule(
        release_track=self.release_track
    )

  def ParseStoragePoolConfig(
      self,
      name,
      service_level,
      network,
      kms_config,
      active_directory,
      enable_ldap,
      capacity,
      description,
      allow_auto_tiering,
      zone,
      replica_zone,
      custom_performance_enabled,
      total_throughput,
      total_iops,
      hot_tier_size,
      enable_hot_tier_auto_resize,
      labels,
      unified_pool,
  ):
    """Parses the command line arguments for Create Storage Pool into a config.

    Args:
      name: the name of the Storage Pool
      service_level: the service level of the Storage Pool
      network: the network of the Storage Pool
      kms_config: the KMS Config of the Storage Pool
      active_directory: the Active Directory of the Storage Pool
      enable_ldap: Bool on whether to enable LDAP on Storage Pool
      capacity: the storage capacity of the Storage Pool
      description: the description of the Storage Pool
      allow_auto_tiering: Bool on whether Storage Pool supports auto tiering
      zone: zone of the Storage Pool
      replica_zone: Replica zone for the Storage Pool
      custom_performance_enabled: Bool on whether custom performance is enabled
      total_throughput: Total throughput of the Storage Pool
      total_iops: Total IOPS of the Storage Pool
      hot_tier_size: Hot tier size of the Storage Pool
      enable_hot_tier_auto_resize: Bool on whether hot tier auto resize is
        enabled
      labels: the parsed labels value
      unified_pool: Bool on whether the Storage Pool is a unified pool

    Returns:
      The configuration that will be used as the request body for creating a
      Cloud NetApp Storage Pool.
    """
    storage_pool = self.messages.StoragePool()
    storage_pool.name = name
    storage_pool.serviceLevel = service_level
    storage_pool.network = network.get('name')
    if 'psa-range' in network:
      storage_pool.psaRange = network.get('psa-range')
    storage_pool.kmsConfig = kms_config
    storage_pool.activeDirectory = active_directory
    storage_pool.ldapEnabled = enable_ldap
    storage_pool.capacityGib = capacity
    storage_pool.description = description
    if allow_auto_tiering is not None:
      storage_pool.allowAutoTiering = allow_auto_tiering
    if zone is not None:
      storage_pool.zone = zone
    if replica_zone is not None:
      storage_pool.replicaZone = replica_zone
    if custom_performance_enabled is not None:
      storage_pool.customPerformanceEnabled = custom_performance_enabled
    if total_throughput is not None:
      storage_pool.totalThroughputMibps = total_throughput
    if total_iops is not None:
      storage_pool.totalIops = total_iops
    if hot_tier_size is not None:
      storage_pool.hotTierSizeGib = hot_tier_size
    if enable_hot_tier_auto_resize is not None:
      storage_pool.enableHotTierAutoResize = enable_hot_tier_auto_resize
    storage_pool.labels = labels
    if unified_pool is not None:
      storage_pool.unifiedPool = unified_pool
    return storage_pool

  def ParseUpdatedStoragePoolConfig(
      self,
      storagepool_config,
      description=None,
      active_directory=None,
      labels=None,
      capacity=None,
      allow_auto_tiering=None,
      zone=None,
      replica_zone=None,
      total_throughput=None,
      total_iops=None,
      hot_tier_size=None,
      enable_hot_tier_auto_resize=None,
  ):
    """Parse update information into an updated Storage Pool message."""
    if capacity is not None:
      storagepool_config.capacityGib = capacity
    if active_directory is not None:
      storagepool_config.activeDirectory = active_directory
    if description is not None:
      storagepool_config.description = description
    if allow_auto_tiering is not None:
      storagepool_config.allowAutoTiering = allow_auto_tiering
    if zone is not None:
      storagepool_config.zone = zone
    if replica_zone is not None:
      storagepool_config.replicaZone = replica_zone
    if total_throughput is not None:
      storagepool_config.totalThroughputMibps = total_throughput
    if total_iops is not None:
      storagepool_config.totalIops = total_iops
    if hot_tier_size is not None:
      storagepool_config.hotTierSizeGib = hot_tier_size
    if enable_hot_tier_auto_resize is not None:
      storagepool_config.enableHotTierAutoResize = enable_hot_tier_auto_resize
    if labels is not None:
      storagepool_config.labels = labels
    return storagepool_config

  def UpdateStoragePool(self, storagepool_ref, storagepool_config, update_mask):
    """Send a Patch request for the Cloud NetApp Storage Pool."""
    update_request = (
        self.messages.NetappProjectsLocationsStoragePoolsPatchRequest(
            storagePool=storagepool_config,
            name=storagepool_ref.RelativeName(),
            updateMask=update_mask,
        )
    )
    update_op = self.client.projects_locations_storagePools.Patch(
        update_request
    )
    return update_op

  def SwitchStoragePool(self, storagepool_ref):
    """Send a switch zone request for the Cloud NetApp storage pool."""
    switch_request = (
        self.messages.NetappProjectsLocationsStoragePoolsSwitchRequest(
            name=storagepool_ref.RelativeName(),
        )
    )
    return self.client.projects_locations_storagePools.Switch(switch_request)

  def ValidateDirectoryService(self, storagepool_ref, directory_service_type):
    """Send a validate directory service request for the Cloud NetApp storage pool."""
    request = self.messages.ValidateDirectoryServiceRequest(
        directoryServiceType=directory_service_type,
    )
    validate_request = self.messages.NetappProjectsLocationsStoragePoolsValidateDirectoryServiceRequest(
        name=storagepool_ref.RelativeName(),
        validateDirectoryServiceRequest=request,
    )
    return self.client.projects_locations_storagePools.ValidateDirectoryService(
        validate_request
    )


class BetaStoragePoolsAdapter(StoragePoolsAdapter):
  """Adapter for the Beta Cloud NetApp Files API for Storage Pools."""

  def __init__(self):
    super(BetaStoragePoolsAdapter, self).__init__()
    self.release_track = base.ReleaseTrack.BETA
    self.client = netapp_api_util.GetClientInstance(
        release_track=self.release_track
    )
    self.messages = netapp_api_util.GetMessagesModule(
        release_track=self.release_track
    )


class AlphaStoragePoolsAdapter(BetaStoragePoolsAdapter):
  """Adapter for the Alpha Cloud NetApp Files API for Storage Pools."""

  def __init__(self):
    super(AlphaStoragePoolsAdapter, self).__init__()
    self.release_track = base.ReleaseTrack.ALPHA
    self.client = netapp_api_util.GetClientInstance(
        release_track=self.release_track
    )
    self.messages = netapp_api_util.GetMessagesModule(
        release_track=self.release_track
    )

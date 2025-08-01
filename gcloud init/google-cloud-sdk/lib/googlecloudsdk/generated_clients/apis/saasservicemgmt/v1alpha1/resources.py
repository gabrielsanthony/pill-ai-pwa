# -*- coding: utf-8 -*- #
# Copyright 2023 Google LLC. All Rights Reserved.
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
"""Resource definitions for Cloud Platform Apis generated from apitools."""

import enum


BASE_URL = 'https://saasservicemgmt.googleapis.com/v1alpha1/'
DOCS_URL = 'https://cloud.google.com/saas-runtime/docs'


class Collections(enum.Enum):
  """Collections for all supported apis."""

  PROJECTS = (
      'projects',
      'projects/{projectsId}',
      {},
      ['projectsId'],
      True
  )
  PROJECTS_LOCATIONS = (
      'projects.locations',
      '{+name}',
      {
          '':
              'projects/{projectsId}/locations/{locationsId}',
      },
      ['name'],
      True
  )
  PROJECTS_LOCATIONS_FLAGRELEASES = (
      'projects.locations.flagReleases',
      '{+name}',
      {
          '':
              'projects/{projectsId}/locations/{locationsId}/flagReleases/'
              '{flagReleasesId}',
      },
      ['name'],
      True
  )
  PROJECTS_LOCATIONS_FLAGREVISIONS = (
      'projects.locations.flagRevisions',
      '{+name}',
      {
          '':
              'projects/{projectsId}/locations/{locationsId}/flagRevisions/'
              '{flagRevisionsId}',
      },
      ['name'],
      True
  )
  PROJECTS_LOCATIONS_FLAGS = (
      'projects.locations.flags',
      '{+name}',
      {
          '':
              'projects/{projectsId}/locations/{locationsId}/flags/{flagsId}',
      },
      ['name'],
      True
  )
  PROJECTS_LOCATIONS_OPERATIONS = (
      'projects.locations.operations',
      '{+name}',
      {
          '':
              'projects/{projectsId}/locations/{locationsId}/operations/'
              '{operationsId}',
      },
      ['name'],
      True
  )
  PROJECTS_LOCATIONS_RELEASES = (
      'projects.locations.releases',
      '{+name}',
      {
          '':
              'projects/{projectsId}/locations/{locationsId}/releases/'
              '{releasesId}',
      },
      ['name'],
      True
  )
  PROJECTS_LOCATIONS_ROLLOUTKINDS = (
      'projects.locations.rolloutKinds',
      '{+name}',
      {
          '':
              'projects/{projectsId}/locations/{locationsId}/rolloutKinds/'
              '{rolloutKindsId}',
      },
      ['name'],
      True
  )
  PROJECTS_LOCATIONS_ROLLOUTTYPES = (
      'projects.locations.rolloutTypes',
      '{+name}',
      {
          '':
              'projects/{projectsId}/locations/{locationsId}/rolloutTypes/'
              '{rolloutTypesId}',
      },
      ['name'],
      True
  )
  PROJECTS_LOCATIONS_ROLLOUTS = (
      'projects.locations.rollouts',
      '{+name}',
      {
          '':
              'projects/{projectsId}/locations/{locationsId}/rollouts/'
              '{rolloutsId}',
      },
      ['name'],
      True
  )
  PROJECTS_LOCATIONS_SAAS = (
      'projects.locations.saas',
      '{+name}',
      {
          '':
              'projects/{projectsId}/locations/{locationsId}/saas/{saasId}',
      },
      ['name'],
      True
  )
  PROJECTS_LOCATIONS_SAASTYPES = (
      'projects.locations.saasTypes',
      '{+name}',
      {
          '':
              'projects/{projectsId}/locations/{locationsId}/saasTypes/'
              '{saasTypesId}',
      },
      ['name'],
      True
  )
  PROJECTS_LOCATIONS_TENANTS = (
      'projects.locations.tenants',
      '{+name}',
      {
          '':
              'projects/{projectsId}/locations/{locationsId}/tenants/'
              '{tenantsId}',
      },
      ['name'],
      True
  )
  PROJECTS_LOCATIONS_UNITKINDS = (
      'projects.locations.unitKinds',
      '{+name}',
      {
          '':
              'projects/{projectsId}/locations/{locationsId}/unitKinds/'
              '{unitKindsId}',
      },
      ['name'],
      True
  )
  PROJECTS_LOCATIONS_UNITOPERATIONS = (
      'projects.locations.unitOperations',
      '{+name}',
      {
          '':
              'projects/{projectsId}/locations/{locationsId}/unitOperations/'
              '{unitOperationsId}',
      },
      ['name'],
      True
  )
  PROJECTS_LOCATIONS_UNITS = (
      'projects.locations.units',
      '{+name}',
      {
          '':
              'projects/{projectsId}/locations/{locationsId}/units/{unitsId}',
      },
      ['name'],
      True
  )

  def __init__(self, collection_name, path, flat_paths, params,
               enable_uri_parsing):
    self.collection_name = collection_name
    self.path = path
    self.flat_paths = flat_paths
    self.params = params
    self.enable_uri_parsing = enable_uri_parsing

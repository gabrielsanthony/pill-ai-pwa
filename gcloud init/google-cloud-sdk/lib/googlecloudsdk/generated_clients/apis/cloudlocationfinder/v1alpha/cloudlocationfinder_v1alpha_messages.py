"""Generated message classes for cloudlocationfinder version v1alpha.

"""
# NOTE: This file is autogenerated and should not be edited by hand.

from __future__ import absolute_import

from apitools.base.protorpclite import messages as _messages
from apitools.base.py import encoding
from apitools.base.py import extra_types


package = 'cloudlocationfinder'


class CloudLocation(_messages.Message):
  r"""Represents resource cloud locations.

  Enums:
    CloudLocationTypeValueValuesEnum: Optional. The type of the cloud
      location.
    CloudProviderValueValuesEnum: Optional. The provider of the cloud
      location. Values can be Google Cloud or third-party providers, including
      AWS, Azure, or Oracle Cloud Infrastructure.

  Fields:
    carbonFreeEnergyPercentage: Optional. The carbon free energy percentage of
      the cloud location. This represents the average percentage of time
      customers' application will be running on carbon-free energy. See
      https://cloud.google.com/sustainability/region-carbon for more details.
      There is a difference between default value 0 and unset value. 0 means
      the carbon free energy percentage is 0%, while unset value means the
      carbon footprint data is not available.
    cloudLocationType: Optional. The type of the cloud location.
    cloudProvider: Optional. The provider of the cloud location. Values can be
      Google Cloud or third-party providers, including AWS, Azure, or Oracle
      Cloud Infrastructure.
    containingCloudLocation: Output only. The containing cloud location in the
      strict nesting hierarchy. For example, the containing cloud location of
      a zone is a region.
    displayName: Optional. The human-readable name of the cloud location.
      Example: us-east-2, us-east1.
    name: Identifier. Name of the cloud location. Unique name of the cloud
      location including project and location using the form: `projects/{proje
      ct_id}/locations/{location}/cloudLocations/{cloud_location}`
    territoryCode: Optional. The two-letter ISO 3166-1 alpha-2 code of the
      cloud location. Examples: US, JP, KR.
  """

  class CloudLocationTypeValueValuesEnum(_messages.Enum):
    r"""Optional. The type of the cloud location.

    Values:
      CLOUD_LOCATION_TYPE_UNSPECIFIED: Unspecified type.
      CLOUD_LOCATION_TYPE_REGION: CloudLocation type for region.
      CLOUD_LOCATION_TYPE_ZONE: CloudLocation type for zone.
      CLOUD_LOCATION_TYPE_REGION_EXTENSION: CloudLocation type for region
        extension.
      CLOUD_LOCATION_TYPE_GDCC_ZONE: CloudLocation type for Google Distributed
        Cloud Connected Zone.
    """
    CLOUD_LOCATION_TYPE_UNSPECIFIED = 0
    CLOUD_LOCATION_TYPE_REGION = 1
    CLOUD_LOCATION_TYPE_ZONE = 2
    CLOUD_LOCATION_TYPE_REGION_EXTENSION = 3
    CLOUD_LOCATION_TYPE_GDCC_ZONE = 4

  class CloudProviderValueValuesEnum(_messages.Enum):
    r"""Optional. The provider of the cloud location. Values can be Google
    Cloud or third-party providers, including AWS, Azure, or Oracle Cloud
    Infrastructure.

    Values:
      CLOUD_PROVIDER_UNSPECIFIED: Unspecified type.
      CLOUD_PROVIDER_GCP: Cloud provider type for Google Cloud.
      CLOUD_PROVIDER_AWS: Cloud provider type for AWS.
      CLOUD_PROVIDER_AZURE: Cloud provider type for Azure.
      CLOUD_PROVIDER_OCI: Cloud provider type for OCI.
    """
    CLOUD_PROVIDER_UNSPECIFIED = 0
    CLOUD_PROVIDER_GCP = 1
    CLOUD_PROVIDER_AWS = 2
    CLOUD_PROVIDER_AZURE = 3
    CLOUD_PROVIDER_OCI = 4

  carbonFreeEnergyPercentage = _messages.FloatField(1, variant=_messages.Variant.FLOAT)
  cloudLocationType = _messages.EnumField('CloudLocationTypeValueValuesEnum', 2)
  cloudProvider = _messages.EnumField('CloudProviderValueValuesEnum', 3)
  containingCloudLocation = _messages.StringField(4)
  displayName = _messages.StringField(5)
  name = _messages.StringField(6)
  territoryCode = _messages.StringField(7)


class CloudlocationfinderProjectsLocationsCloudLocationsGetRequest(_messages.Message):
  r"""A CloudlocationfinderProjectsLocationsCloudLocationsGetRequest object.

  Fields:
    name: Required. Name of the resource.
  """

  name = _messages.StringField(1, required=True)


class CloudlocationfinderProjectsLocationsCloudLocationsListRequest(_messages.Message):
  r"""A CloudlocationfinderProjectsLocationsCloudLocationsListRequest object.

  Fields:
    filter: Optional. A filter expression that filters resources listed in the
      response. The expression is in the form of field=value. For example,
      'cloud_location_type=CLOUD_LOCATION_TYPE_REGION'. Multiple filter
      queries are space-separated. For example,
      'cloud_location_type=CLOUD_LOCATION_TYPE_REGION territory_code="US"' By
      default, each expression is an AND expression. However, you can include
      AND and OR expressions explicitly.
    pageSize: Optional. The maximum number of cloud locations to return per
      page. The service might return fewer cloud locations than this value. If
      unspecified, server will pick an appropriate default.
    pageToken: Optional. A token identifying a page of results the server
      should return. Provide page token returned by a previous
      'ListCloudLocations' call to retrieve the next page of results. When
      paginating, all other parameters provided to 'ListCloudLocations' must
      match the call that provided the page token.
    parent: Required. The parent, which owns this collection of cloud
      locations. Format: projects/{project}/locations/{location}
  """

  filter = _messages.StringField(1)
  pageSize = _messages.IntegerField(2, variant=_messages.Variant.INT32)
  pageToken = _messages.StringField(3)
  parent = _messages.StringField(4, required=True)


class CloudlocationfinderProjectsLocationsCloudLocationsSearchRequest(_messages.Message):
  r"""A CloudlocationfinderProjectsLocationsCloudLocationsSearchRequest
  object.

  Fields:
    pageSize: Optional. The maximum number of cloud locations to return. The
      service might return fewer cloud locations than this value. If
      unspecified, server will pick an appropriate default.
    pageToken: Optional. A token identifying a page of results the server
      should return. Provide Page token returned by a previous
      'ListCloudLocations' call to retrieve the next page of results. When
      paginating, all other parameters provided to 'ListCloudLocations' must
      match the call that provided the page token.
    parent: Required. The parent, which owns this collection of cloud
      locations. Format: projects/{project}/locations/{location}
    query: Optional. The query string in search query syntax. While filter is
      used to filter the search results by attributes, query is used to
      specify the search requirements.
    sourceCloudLocation: Required. The source cloud location to search from.
      Example search can be searching nearby cloud locations from the source
      cloud location by latency.
  """

  pageSize = _messages.IntegerField(1, variant=_messages.Variant.INT32)
  pageToken = _messages.StringField(2)
  parent = _messages.StringField(3, required=True)
  query = _messages.StringField(4)
  sourceCloudLocation = _messages.StringField(5)


class CloudlocationfinderProjectsLocationsGetRequest(_messages.Message):
  r"""A CloudlocationfinderProjectsLocationsGetRequest object.

  Fields:
    name: Resource name for the location.
  """

  name = _messages.StringField(1, required=True)


class CloudlocationfinderProjectsLocationsListRequest(_messages.Message):
  r"""A CloudlocationfinderProjectsLocationsListRequest object.

  Fields:
    extraLocationTypes: Optional. A list of extra location types that should
      be used as conditions for controlling the visibility of the locations.
    filter: A filter to narrow down results to a preferred subset. The
      filtering language accepts strings like `"displayName=tokyo"`, and is
      documented in more detail in [AIP-160](https://google.aip.dev/160).
    name: The resource that owns the locations collection, if applicable.
    pageSize: The maximum number of results to return. If not set, the service
      selects a default.
    pageToken: A page token received from the `next_page_token` field in the
      response. Send that page token to receive the subsequent page.
  """

  extraLocationTypes = _messages.StringField(1, repeated=True)
  filter = _messages.StringField(2)
  name = _messages.StringField(3, required=True)
  pageSize = _messages.IntegerField(4, variant=_messages.Variant.INT32)
  pageToken = _messages.StringField(5)


class ListCloudLocationsResponse(_messages.Message):
  r"""Message for response to listing cloud locations.

  Fields:
    cloudLocations: Output only. List of cloud locations.
    nextPageToken: Output only. The continuation token, used to page through
      large result sets. Provide this value in a subsequent request as
      page_token in subsequent requests to retrieve the next page. If this
      field is not present, there are no subsequent results.
  """

  cloudLocations = _messages.MessageField('CloudLocation', 1, repeated=True)
  nextPageToken = _messages.StringField(2)


class ListLocationsResponse(_messages.Message):
  r"""The response message for Locations.ListLocations.

  Fields:
    locations: A list of locations that matches the specified filter in the
      request.
    nextPageToken: The standard List next-page token.
  """

  locations = _messages.MessageField('Location', 1, repeated=True)
  nextPageToken = _messages.StringField(2)


class Location(_messages.Message):
  r"""A resource that represents a Google Cloud location.

  Messages:
    LabelsValue: Cross-service attributes for the location. For example
      {"cloud.googleapis.com/region": "us-east1"}
    MetadataValue: Service-specific metadata. For example the available
      capacity at the given location.

  Fields:
    displayName: The friendly name for this location, typically a nearby city
      name. For example, "Tokyo".
    labels: Cross-service attributes for the location. For example
      {"cloud.googleapis.com/region": "us-east1"}
    locationId: The canonical id for this location. For example: `"us-east1"`.
    metadata: Service-specific metadata. For example the available capacity at
      the given location.
    name: Resource name for the location, which may vary between
      implementations. For example: `"projects/example-project/locations/us-
      east1"`
  """

  @encoding.MapUnrecognizedFields('additionalProperties')
  class LabelsValue(_messages.Message):
    r"""Cross-service attributes for the location. For example
    {"cloud.googleapis.com/region": "us-east1"}

    Messages:
      AdditionalProperty: An additional property for a LabelsValue object.

    Fields:
      additionalProperties: Additional properties of type LabelsValue
    """

    class AdditionalProperty(_messages.Message):
      r"""An additional property for a LabelsValue object.

      Fields:
        key: Name of the additional property.
        value: A string attribute.
      """

      key = _messages.StringField(1)
      value = _messages.StringField(2)

    additionalProperties = _messages.MessageField('AdditionalProperty', 1, repeated=True)

  @encoding.MapUnrecognizedFields('additionalProperties')
  class MetadataValue(_messages.Message):
    r"""Service-specific metadata. For example the available capacity at the
    given location.

    Messages:
      AdditionalProperty: An additional property for a MetadataValue object.

    Fields:
      additionalProperties: Properties of the object. Contains field @type
        with type URL.
    """

    class AdditionalProperty(_messages.Message):
      r"""An additional property for a MetadataValue object.

      Fields:
        key: Name of the additional property.
        value: A extra_types.JsonValue attribute.
      """

      key = _messages.StringField(1)
      value = _messages.MessageField('extra_types.JsonValue', 2)

    additionalProperties = _messages.MessageField('AdditionalProperty', 1, repeated=True)

  displayName = _messages.StringField(1)
  labels = _messages.MessageField('LabelsValue', 2)
  locationId = _messages.StringField(3)
  metadata = _messages.MessageField('MetadataValue', 4)
  name = _messages.StringField(5)


class SearchCloudLocationsResponse(_messages.Message):
  r"""Message for response to searching cloud locations.

  Fields:
    cloudLocations: Output only. List of cloud locations.
    nextPageToken: Output only. The continuation token, used to page through
      large result sets. Provide this value in a subsequent request as
      page_token in subsequent requests to retrieve the next page. If this
      field is not present, there are no subsequent results.
  """

  cloudLocations = _messages.MessageField('CloudLocation', 1, repeated=True)
  nextPageToken = _messages.StringField(2)


class StandardQueryParameters(_messages.Message):
  r"""Query parameters accepted by all methods.

  Enums:
    FXgafvValueValuesEnum: V1 error format.
    AltValueValuesEnum: Data format for response.

  Fields:
    f__xgafv: V1 error format.
    access_token: OAuth access token.
    alt: Data format for response.
    callback: JSONP
    fields: Selector specifying which fields to include in a partial response.
    key: API key. Your API key identifies your project and provides you with
      API access, quota, and reports. Required unless you provide an OAuth 2.0
      token.
    oauth_token: OAuth 2.0 token for the current user.
    prettyPrint: Returns response with indentations and line breaks.
    quotaUser: Available to use for quota purposes for server-side
      applications. Can be any arbitrary string assigned to a user, but should
      not exceed 40 characters.
    trace: A tracing token of the form "token:<tokenid>" to include in api
      requests.
    uploadType: Legacy upload protocol for media (e.g. "media", "multipart").
    upload_protocol: Upload protocol for media (e.g. "raw", "multipart").
  """

  class AltValueValuesEnum(_messages.Enum):
    r"""Data format for response.

    Values:
      json: Responses with Content-Type of application/json
      media: Media download with context-dependent Content-Type
      proto: Responses with Content-Type of application/x-protobuf
    """
    json = 0
    media = 1
    proto = 2

  class FXgafvValueValuesEnum(_messages.Enum):
    r"""V1 error format.

    Values:
      _1: v1 error format
      _2: v2 error format
    """
    _1 = 0
    _2 = 1

  f__xgafv = _messages.EnumField('FXgafvValueValuesEnum', 1)
  access_token = _messages.StringField(2)
  alt = _messages.EnumField('AltValueValuesEnum', 3, default='json')
  callback = _messages.StringField(4)
  fields = _messages.StringField(5)
  key = _messages.StringField(6)
  oauth_token = _messages.StringField(7)
  prettyPrint = _messages.BooleanField(8, default=True)
  quotaUser = _messages.StringField(9)
  trace = _messages.StringField(10)
  uploadType = _messages.StringField(11)
  upload_protocol = _messages.StringField(12)


encoding.AddCustomJsonFieldMapping(
    StandardQueryParameters, 'f__xgafv', '$.xgafv')
encoding.AddCustomJsonEnumMapping(
    StandardQueryParameters.FXgafvValueValuesEnum, '_1', '1')
encoding.AddCustomJsonEnumMapping(
    StandardQueryParameters.FXgafvValueValuesEnum, '_2', '2')

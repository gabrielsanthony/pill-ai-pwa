"""Generated message classes for gkerecommender version v1.

GKE Recommender API
"""
# NOTE: This file is autogenerated and should not be edited by hand.

from __future__ import absolute_import

from apitools.base.protorpclite import messages as _messages
from apitools.base.py import encoding


package = 'gkerecommender'


class Amount(_messages.Message):
  r"""A Amount object.

  Fields:
    nanos: A integer attribute.
    units: A string attribute.
  """

  nanos = _messages.IntegerField(1, variant=_messages.Variant.INT32)
  units = _messages.IntegerField(2)


class Cost(_messages.Message):
  r"""A Cost object.

  Fields:
    costPerMillionInputTokens: A Amount attribute.
    costPerMillionOutputTokens: A Amount attribute.
    outputToInputCostRatio: A number attribute.
    pricingModel: A string attribute.
  """

  costPerMillionInputTokens = _messages.MessageField('Amount', 1)
  costPerMillionOutputTokens = _messages.MessageField('Amount', 2)
  outputToInputCostRatio = _messages.FloatField(3, variant=_messages.Variant.FLOAT)
  pricingModel = _messages.StringField(4)


class GenerateOptimizedManifestResponse(_messages.Message):
  r"""A GenerateOptimizedManifestResponse object.

  Fields:
    comments: A string attribute.
    k8sManifests: A K8SManifest attribute.
    manifestVersion: A string attribute.
  """

  comments = _messages.StringField(1, repeated=True)
  k8sManifests = _messages.MessageField('K8SManifest', 2, repeated=True)
  manifestVersion = _messages.StringField(3)


class GetBenchmarkingDataResponse(_messages.Message):
  r"""A GetBenchmarkingDataResponse object.

  Fields:
    profile: A Profile attribute.
  """

  profile = _messages.MessageField('Profile', 1, repeated=True)


class GkerecommenderGetBenchmarkingDataRequest(_messages.Message):
  r"""A GkerecommenderGetBenchmarkingDataRequest object.

  Fields:
    instanceType: A string attribute.
    modelAndModelServerInfo_modelName: A string attribute.
    modelAndModelServerInfo_modelServerName: A string attribute.
    modelAndModelServerInfo_modelServerVersion: A string attribute.
  """

  instanceType = _messages.StringField(1, default='ANY')
  modelAndModelServerInfo_modelName = _messages.StringField(2)
  modelAndModelServerInfo_modelServerName = _messages.StringField(3)
  modelAndModelServerInfo_modelServerVersion = _messages.StringField(4, default='LATEST')


class GkerecommenderModelServersListRequest(_messages.Message):
  r"""A GkerecommenderModelServersListRequest object.

  Fields:
    modelName: A string attribute.
  """

  modelName = _messages.StringField(1)


class GkerecommenderModelServersVersionsListRequest(_messages.Message):
  r"""A GkerecommenderModelServersVersionsListRequest object.

  Fields:
    modelName: A string attribute.
    modelServerName: A string attribute.
  """

  modelName = _messages.StringField(1)
  modelServerName = _messages.StringField(2, required=True)


class GkerecommenderModelsListRequest(_messages.Message):
  r"""A GkerecommenderModelsListRequest object."""


class GkerecommenderOptimizedManifestRequest(_messages.Message):
  r"""A GkerecommenderOptimizedManifestRequest object.

  Fields:
    acceleratorType: A string attribute.
    kubernetesNamespace: A string attribute.
    modelAndModelServerInfo_modelName: A string attribute.
    modelAndModelServerInfo_modelServerName: A string attribute.
    modelAndModelServerInfo_modelServerVersion: A string attribute.
    performanceRequirements_targetCost_costPerMillionInputTokens_nanos: A
      integer attribute.
    performanceRequirements_targetCost_costPerMillionInputTokens_units: A
      string attribute.
    performanceRequirements_targetCost_costPerMillionOutputTokens_nanos: A
      integer attribute.
    performanceRequirements_targetCost_costPerMillionOutputTokens_units: A
      string attribute.
    performanceRequirements_targetCost_outputToInputCostRatio: A number
      attribute.
    performanceRequirements_targetCost_pricingModel: A string attribute.
    performanceRequirements_targetNtpotMilliseconds: A integer attribute.
    performanceRequirements_targetTtftMilliseconds: A integer attribute.
    storageConfig_modelBucketUri: A string attribute.
    storageConfig_xlaCacheBucketUri: A string attribute.
  """

  acceleratorType = _messages.StringField(1)
  kubernetesNamespace = _messages.StringField(2, default='default')
  modelAndModelServerInfo_modelName = _messages.StringField(3)
  modelAndModelServerInfo_modelServerName = _messages.StringField(4)
  modelAndModelServerInfo_modelServerVersion = _messages.StringField(5, default='LATEST')
  performanceRequirements_targetCost_costPerMillionInputTokens_nanos = _messages.IntegerField(6, variant=_messages.Variant.INT32)
  performanceRequirements_targetCost_costPerMillionInputTokens_units = _messages.IntegerField(7)
  performanceRequirements_targetCost_costPerMillionOutputTokens_nanos = _messages.IntegerField(8, variant=_messages.Variant.INT32)
  performanceRequirements_targetCost_costPerMillionOutputTokens_units = _messages.IntegerField(9)
  performanceRequirements_targetCost_outputToInputCostRatio = _messages.FloatField(10, variant=_messages.Variant.FLOAT, default=4)
  performanceRequirements_targetCost_pricingModel = _messages.StringField(11, default='spot')
  performanceRequirements_targetNtpotMilliseconds = _messages.IntegerField(12, variant=_messages.Variant.INT32, default=999999)
  performanceRequirements_targetTtftMilliseconds = _messages.IntegerField(13, variant=_messages.Variant.INT32, default=999999)
  storageConfig_modelBucketUri = _messages.StringField(14)
  storageConfig_xlaCacheBucketUri = _messages.StringField(15)


class GkerecommenderProfilesListRequest(_messages.Message):
  r"""A GkerecommenderProfilesListRequest object.

  Fields:
    modelName: A string attribute.
    modelServerName: A string attribute.
    modelServerVersion: A string attribute.
    performanceRequirements_targetCost_costPerMillionInputTokens_nanos: A
      integer attribute.
    performanceRequirements_targetCost_costPerMillionInputTokens_units: A
      string attribute.
    performanceRequirements_targetCost_costPerMillionOutputTokens_nanos: A
      integer attribute.
    performanceRequirements_targetCost_costPerMillionOutputTokens_units: A
      string attribute.
    performanceRequirements_targetCost_outputToInputCostRatio: A number
      attribute.
    performanceRequirements_targetCost_pricingModel: A string attribute.
    performanceRequirements_targetNtpotMilliseconds: A integer attribute.
    performanceRequirements_targetTtftMilliseconds: A integer attribute.
  """

  modelName = _messages.StringField(1, default='ANY')
  modelServerName = _messages.StringField(2, default='ANY')
  modelServerVersion = _messages.StringField(3, default='LATEST')
  performanceRequirements_targetCost_costPerMillionInputTokens_nanos = _messages.IntegerField(4, variant=_messages.Variant.INT32)
  performanceRequirements_targetCost_costPerMillionInputTokens_units = _messages.IntegerField(5)
  performanceRequirements_targetCost_costPerMillionOutputTokens_nanos = _messages.IntegerField(6, variant=_messages.Variant.INT32)
  performanceRequirements_targetCost_costPerMillionOutputTokens_units = _messages.IntegerField(7)
  performanceRequirements_targetCost_outputToInputCostRatio = _messages.FloatField(8, variant=_messages.Variant.FLOAT, default=4)
  performanceRequirements_targetCost_pricingModel = _messages.StringField(9, default='spot')
  performanceRequirements_targetNtpotMilliseconds = _messages.IntegerField(10, variant=_messages.Variant.INT32, default=999999)
  performanceRequirements_targetTtftMilliseconds = _messages.IntegerField(11, variant=_messages.Variant.INT32, default=999999)


class K8SManifest(_messages.Message):
  r"""A K8SManifest object.

  Fields:
    apiVersion: A string attribute.
    content: A string attribute.
    kind: A string attribute.
  """

  apiVersion = _messages.StringField(1)
  content = _messages.StringField(2)
  kind = _messages.StringField(3)


class ListCompatibleProfilesResponse(_messages.Message):
  r"""A ListCompatibleProfilesResponse object.

  Fields:
    comments: A string attribute.
    performanceRange: A PerformanceRange attribute.
    profile: A Profile attribute.
  """

  comments = _messages.StringField(1)
  performanceRange = _messages.MessageField('PerformanceRange', 2)
  profile = _messages.MessageField('Profile', 3, repeated=True)


class ListModelServerVersionsResponse(_messages.Message):
  r"""A ListModelServerVersionsResponse object.

  Fields:
    modelServerVersions: A string attribute.
  """

  modelServerVersions = _messages.StringField(1, repeated=True)


class ListModelServersResponse(_messages.Message):
  r"""A ListModelServersResponse object.

  Fields:
    modelServerNames: A string attribute.
  """

  modelServerNames = _messages.StringField(1, repeated=True)


class ListModelsResponse(_messages.Message):
  r"""A ListModelsResponse object.

  Fields:
    modelNames: A string attribute.
  """

  modelNames = _messages.StringField(1, repeated=True)


class ModelAndModelServerInfo(_messages.Message):
  r"""A ModelAndModelServerInfo object.

  Fields:
    modelName: A string attribute.
    modelServerName: A string attribute.
    modelServerVersion: A string attribute.
  """

  modelName = _messages.StringField(1)
  modelServerName = _messages.StringField(2)
  modelServerVersion = _messages.StringField(3)


class PerformanceRange(_messages.Message):
  r"""A PerformanceRange object.

  Fields:
    ntpotMilliseconds: A Range attribute.
    throughputOutputTokensPerSecond: A Range attribute.
    ttftMilliseconds: A Range attribute.
  """

  ntpotMilliseconds = _messages.MessageField('Range', 1)
  throughputOutputTokensPerSecond = _messages.MessageField('Range', 2)
  ttftMilliseconds = _messages.MessageField('Range', 3)


class PerformanceStats(_messages.Message):
  r"""A PerformanceStats object.

  Fields:
    cost: A Cost attribute.
    ntpotMilliseconds: A integer attribute.
    outputTokensPerSecond: A integer attribute.
    queriesPerSecond: A integer attribute.
    ttftMilliseconds: A integer attribute.
  """

  cost = _messages.MessageField('Cost', 1, repeated=True)
  ntpotMilliseconds = _messages.IntegerField(2, variant=_messages.Variant.INT32)
  outputTokensPerSecond = _messages.IntegerField(3, variant=_messages.Variant.INT32)
  queriesPerSecond = _messages.IntegerField(4, variant=_messages.Variant.INT32)
  ttftMilliseconds = _messages.IntegerField(5, variant=_messages.Variant.INT32)


class Profile(_messages.Message):
  r"""A Profile object.

  Fields:
    acceleratorType: A string attribute.
    instanceType: A string attribute.
    modelAndModelServerInfo: A ModelAndModelServerInfo attribute.
    performanceStats: A PerformanceStats attribute.
    resourcesUsed: A ResourcesUsed attribute.
    tpuTopology: A string attribute.
  """

  acceleratorType = _messages.StringField(1)
  instanceType = _messages.StringField(2)
  modelAndModelServerInfo = _messages.MessageField('ModelAndModelServerInfo', 3)
  performanceStats = _messages.MessageField('PerformanceStats', 4, repeated=True)
  resourcesUsed = _messages.MessageField('ResourcesUsed', 5)
  tpuTopology = _messages.StringField(6)


class Range(_messages.Message):
  r"""A Range object.

  Fields:
    max: A integer attribute.
    min: A integer attribute.
  """

  max = _messages.IntegerField(1, variant=_messages.Variant.INT32)
  min = _messages.IntegerField(2, variant=_messages.Variant.INT32)


class ResourcesUsed(_messages.Message):
  r"""A ResourcesUsed object.

  Fields:
    acceleratorCount: A integer attribute.
    cpu: A string attribute.
    ephemeralStorage: A string attribute.
    memory: A string attribute.
    nodeCount: A integer attribute.
  """

  acceleratorCount = _messages.IntegerField(1, variant=_messages.Variant.INT32)
  cpu = _messages.StringField(2)
  ephemeralStorage = _messages.StringField(3)
  memory = _messages.StringField(4)
  nodeCount = _messages.IntegerField(5, variant=_messages.Variant.INT32)


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
encoding.AddCustomJsonFieldMapping(
    GkerecommenderProfilesListRequest, 'performanceRequirements_targetCost_costPerMillionInputTokens_nanos', 'performanceRequirements.targetCost.costPerMillionInputTokens.nanos')
encoding.AddCustomJsonFieldMapping(
    GkerecommenderProfilesListRequest, 'performanceRequirements_targetCost_costPerMillionInputTokens_units', 'performanceRequirements.targetCost.costPerMillionInputTokens.units')
encoding.AddCustomJsonFieldMapping(
    GkerecommenderProfilesListRequest, 'performanceRequirements_targetCost_costPerMillionOutputTokens_nanos', 'performanceRequirements.targetCost.costPerMillionOutputTokens.nanos')
encoding.AddCustomJsonFieldMapping(
    GkerecommenderProfilesListRequest, 'performanceRequirements_targetCost_costPerMillionOutputTokens_units', 'performanceRequirements.targetCost.costPerMillionOutputTokens.units')
encoding.AddCustomJsonFieldMapping(
    GkerecommenderProfilesListRequest, 'performanceRequirements_targetCost_outputToInputCostRatio', 'performanceRequirements.targetCost.outputToInputCostRatio')
encoding.AddCustomJsonFieldMapping(
    GkerecommenderProfilesListRequest, 'performanceRequirements_targetCost_pricingModel', 'performanceRequirements.targetCost.pricingModel')
encoding.AddCustomJsonFieldMapping(
    GkerecommenderProfilesListRequest, 'performanceRequirements_targetNtpotMilliseconds', 'performanceRequirements.targetNtpotMilliseconds')
encoding.AddCustomJsonFieldMapping(
    GkerecommenderProfilesListRequest, 'performanceRequirements_targetTtftMilliseconds', 'performanceRequirements.targetTtftMilliseconds')
encoding.AddCustomJsonFieldMapping(
    GkerecommenderGetBenchmarkingDataRequest, 'modelAndModelServerInfo_modelName', 'modelAndModelServerInfo.modelName')
encoding.AddCustomJsonFieldMapping(
    GkerecommenderGetBenchmarkingDataRequest, 'modelAndModelServerInfo_modelServerName', 'modelAndModelServerInfo.modelServerName')
encoding.AddCustomJsonFieldMapping(
    GkerecommenderGetBenchmarkingDataRequest, 'modelAndModelServerInfo_modelServerVersion', 'modelAndModelServerInfo.modelServerVersion')
encoding.AddCustomJsonFieldMapping(
    GkerecommenderOptimizedManifestRequest, 'modelAndModelServerInfo_modelName', 'modelAndModelServerInfo.modelName')
encoding.AddCustomJsonFieldMapping(
    GkerecommenderOptimizedManifestRequest, 'modelAndModelServerInfo_modelServerName', 'modelAndModelServerInfo.modelServerName')
encoding.AddCustomJsonFieldMapping(
    GkerecommenderOptimizedManifestRequest, 'modelAndModelServerInfo_modelServerVersion', 'modelAndModelServerInfo.modelServerVersion')
encoding.AddCustomJsonFieldMapping(
    GkerecommenderOptimizedManifestRequest, 'performanceRequirements_targetCost_costPerMillionInputTokens_nanos', 'performanceRequirements.targetCost.costPerMillionInputTokens.nanos')
encoding.AddCustomJsonFieldMapping(
    GkerecommenderOptimizedManifestRequest, 'performanceRequirements_targetCost_costPerMillionInputTokens_units', 'performanceRequirements.targetCost.costPerMillionInputTokens.units')
encoding.AddCustomJsonFieldMapping(
    GkerecommenderOptimizedManifestRequest, 'performanceRequirements_targetCost_costPerMillionOutputTokens_nanos', 'performanceRequirements.targetCost.costPerMillionOutputTokens.nanos')
encoding.AddCustomJsonFieldMapping(
    GkerecommenderOptimizedManifestRequest, 'performanceRequirements_targetCost_costPerMillionOutputTokens_units', 'performanceRequirements.targetCost.costPerMillionOutputTokens.units')
encoding.AddCustomJsonFieldMapping(
    GkerecommenderOptimizedManifestRequest, 'performanceRequirements_targetCost_outputToInputCostRatio', 'performanceRequirements.targetCost.outputToInputCostRatio')
encoding.AddCustomJsonFieldMapping(
    GkerecommenderOptimizedManifestRequest, 'performanceRequirements_targetCost_pricingModel', 'performanceRequirements.targetCost.pricingModel')
encoding.AddCustomJsonFieldMapping(
    GkerecommenderOptimizedManifestRequest, 'performanceRequirements_targetNtpotMilliseconds', 'performanceRequirements.targetNtpotMilliseconds')
encoding.AddCustomJsonFieldMapping(
    GkerecommenderOptimizedManifestRequest, 'performanceRequirements_targetTtftMilliseconds', 'performanceRequirements.targetTtftMilliseconds')
encoding.AddCustomJsonFieldMapping(
    GkerecommenderOptimizedManifestRequest, 'storageConfig_modelBucketUri', 'storageConfig.modelBucketUri')
encoding.AddCustomJsonFieldMapping(
    GkerecommenderOptimizedManifestRequest, 'storageConfig_xlaCacheBucketUri', 'storageConfig.xlaCacheBucketUri')

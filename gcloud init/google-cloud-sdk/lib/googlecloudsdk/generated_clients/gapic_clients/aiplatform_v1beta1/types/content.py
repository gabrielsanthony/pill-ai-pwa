# -*- coding: utf-8 -*-
# Copyright 2024 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
from __future__ import annotations

from typing import MutableMapping, MutableSequence

import proto  # type: ignore

from cloudsdk.google.protobuf import duration_pb2  # type: ignore
from cloudsdk.google.protobuf import struct_pb2  # type: ignore
from google.type import date_pb2  # type: ignore
from googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types import openapi
from googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types import tool
from googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types import vertex_rag_data


__protobuf__ = proto.module(
    package='google.cloud.aiplatform.v1beta1',
    manifest={
        'HarmCategory',
        'Modality',
        'Content',
        'Part',
        'Blob',
        'FileData',
        'VideoMetadata',
        'PrebuiltVoiceConfig',
        'VoiceConfig',
        'SpeechConfig',
        'ProactivityConfig',
        'GenerationConfig',
        'SafetySetting',
        'SafetyRating',
        'CitationMetadata',
        'Citation',
        'Candidate',
        'UrlContextMetadata',
        'UrlMetadata',
        'LogprobsResult',
        'Segment',
        'GroundingChunk',
        'GroundingSupport',
        'GroundingMetadata',
        'SearchEntryPoint',
        'RetrievalMetadata',
        'ModalityTokenCount',
    },
)


class HarmCategory(proto.Enum):
    r"""Harm categories that will block the content.

    Values:
        HARM_CATEGORY_UNSPECIFIED (0):
            The harm category is unspecified.
        HARM_CATEGORY_HATE_SPEECH (1):
            The harm category is hate speech.
        HARM_CATEGORY_DANGEROUS_CONTENT (2):
            The harm category is dangerous content.
        HARM_CATEGORY_HARASSMENT (3):
            The harm category is harassment.
        HARM_CATEGORY_SEXUALLY_EXPLICIT (4):
            The harm category is sexually explicit
            content.
        HARM_CATEGORY_CIVIC_INTEGRITY (5):
            Deprecated: Election filter is not longer
            supported. The harm category is civic integrity.
        HARM_CATEGORY_IMAGE_HATE (6):
            The harm category is image hate.
        HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT (7):
            The harm category is image dangerous content.
        HARM_CATEGORY_IMAGE_HARASSMENT (8):
            The harm category is image harassment.
        HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT (9):
            The harm category is image sexually explicit
            content.
    """
    HARM_CATEGORY_UNSPECIFIED = 0
    HARM_CATEGORY_HATE_SPEECH = 1
    HARM_CATEGORY_DANGEROUS_CONTENT = 2
    HARM_CATEGORY_HARASSMENT = 3
    HARM_CATEGORY_SEXUALLY_EXPLICIT = 4
    HARM_CATEGORY_CIVIC_INTEGRITY = 5
    HARM_CATEGORY_IMAGE_HATE = 6
    HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT = 7
    HARM_CATEGORY_IMAGE_HARASSMENT = 8
    HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT = 9


class Modality(proto.Enum):
    r"""Content Part modality

    Values:
        MODALITY_UNSPECIFIED (0):
            Unspecified modality.
        TEXT (1):
            Plain text.
        IMAGE (2):
            Image.
        VIDEO (3):
            Video.
        AUDIO (4):
            Audio.
        DOCUMENT (5):
            Document, e.g. PDF.
    """
    MODALITY_UNSPECIFIED = 0
    TEXT = 1
    IMAGE = 2
    VIDEO = 3
    AUDIO = 4
    DOCUMENT = 5


class Content(proto.Message):
    r"""The base structured datatype containing multi-part content of a
    message.

    A ``Content`` includes a ``role`` field designating the producer of
    the ``Content`` and a ``parts`` field containing multi-part data
    that contains the content of the message turn.

    Attributes:
        role (str):
            Optional. The producer of the content. Must
            be either 'user' or 'model'.
            Useful to set for multi-turn conversations,
            otherwise can be left blank or unset.
        parts (MutableSequence[googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.Part]):
            Required. Ordered ``Parts`` that constitute a single
            message. Parts may have different IANA MIME types.
    """

    role: str = proto.Field(
        proto.STRING,
        number=1,
    )
    parts: MutableSequence['Part'] = proto.RepeatedField(
        proto.MESSAGE,
        number=2,
        message='Part',
    )


class Part(proto.Message):
    r"""A datatype containing media that is part of a multi-part ``Content``
    message.

    A ``Part`` consists of data which has an associated datatype. A
    ``Part`` can only contain one of the accepted types in
    ``Part.data``.

    A ``Part`` must have a fixed IANA MIME type identifying the type and
    subtype of the media if ``inline_data`` or ``file_data`` field is
    filled with raw bytes.

    This message has `oneof`_ fields (mutually exclusive fields).
    For each oneof, at most one member field can be set at the same time.
    Setting any member of the oneof automatically clears all other
    members.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        text (str):
            Optional. Text part (can be code).

            This field is a member of `oneof`_ ``data``.
        inline_data (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.Blob):
            Optional. Inlined bytes data.

            This field is a member of `oneof`_ ``data``.
        file_data (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.FileData):
            Optional. URI based data.

            This field is a member of `oneof`_ ``data``.
        function_call (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.FunctionCall):
            Optional. A predicted [FunctionCall] returned from the model
            that contains a string representing the
            [FunctionDeclaration.name] with the parameters and their
            values.

            This field is a member of `oneof`_ ``data``.
        function_response (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.FunctionResponse):
            Optional. The result output of a [FunctionCall] that
            contains a string representing the
            [FunctionDeclaration.name] and a structured JSON object
            containing any output from the function call. It is used as
            context to the model.

            This field is a member of `oneof`_ ``data``.
        executable_code (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.ExecutableCode):
            Optional. Code generated by the model that is
            meant to be executed.

            This field is a member of `oneof`_ ``data``.
        code_execution_result (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.CodeExecutionResult):
            Optional. Result of executing the [ExecutableCode].

            This field is a member of `oneof`_ ``data``.
        video_metadata (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.VideoMetadata):
            Optional. Video metadata. The metadata should only be
            specified while the video data is presented in inline_data
            or file_data.

            This field is a member of `oneof`_ ``metadata``.
        thought (bool):
            Optional. Indicates if the part is thought
            from the model.
        thought_signature (bytes):
            Optional. An opaque signature for the thought
            so it can be reused in subsequent requests.
    """

    text: str = proto.Field(
        proto.STRING,
        number=1,
        oneof='data',
    )
    inline_data: 'Blob' = proto.Field(
        proto.MESSAGE,
        number=2,
        oneof='data',
        message='Blob',
    )
    file_data: 'FileData' = proto.Field(
        proto.MESSAGE,
        number=3,
        oneof='data',
        message='FileData',
    )
    function_call: tool.FunctionCall = proto.Field(
        proto.MESSAGE,
        number=5,
        oneof='data',
        message=tool.FunctionCall,
    )
    function_response: tool.FunctionResponse = proto.Field(
        proto.MESSAGE,
        number=6,
        oneof='data',
        message=tool.FunctionResponse,
    )
    executable_code: tool.ExecutableCode = proto.Field(
        proto.MESSAGE,
        number=8,
        oneof='data',
        message=tool.ExecutableCode,
    )
    code_execution_result: tool.CodeExecutionResult = proto.Field(
        proto.MESSAGE,
        number=9,
        oneof='data',
        message=tool.CodeExecutionResult,
    )
    video_metadata: 'VideoMetadata' = proto.Field(
        proto.MESSAGE,
        number=4,
        oneof='metadata',
        message='VideoMetadata',
    )
    thought: bool = proto.Field(
        proto.BOOL,
        number=10,
    )
    thought_signature: bytes = proto.Field(
        proto.BYTES,
        number=11,
    )


class Blob(proto.Message):
    r"""Content blob.

    Attributes:
        mime_type (str):
            Required. The IANA standard MIME type of the
            source data.
        data (bytes):
            Required. Raw bytes.
        display_name (str):
            Optional. Display name of the blob.

            Used to provide a label or filename to distinguish blobs.

            This field is only returned in PromptMessage for prompt
            management. It is currently used in the Gemini
            GenerateContent calls only when server side tools
            (code_execution, google_search, and url_context) are
            enabled.
    """

    mime_type: str = proto.Field(
        proto.STRING,
        number=1,
    )
    data: bytes = proto.Field(
        proto.BYTES,
        number=2,
    )
    display_name: str = proto.Field(
        proto.STRING,
        number=4,
    )


class FileData(proto.Message):
    r"""URI based data.

    Attributes:
        mime_type (str):
            Required. The IANA standard MIME type of the
            source data.
        file_uri (str):
            Required. URI.
        display_name (str):
            Optional. Display name of the file data.

            Used to provide a label or filename to distinguish file
            datas.

            This field is only returned in PromptMessage for prompt
            management. It is currently used in the Gemini
            GenerateContent calls only when server side tools
            (code_execution, google_search, and url_context) are
            enabled.
    """

    mime_type: str = proto.Field(
        proto.STRING,
        number=1,
    )
    file_uri: str = proto.Field(
        proto.STRING,
        number=2,
    )
    display_name: str = proto.Field(
        proto.STRING,
        number=3,
    )


class VideoMetadata(proto.Message):
    r"""Metadata describes the input video content.

    Attributes:
        start_offset (google.protobuf.duration_pb2.Duration):
            Optional. The start offset of the video.
        end_offset (google.protobuf.duration_pb2.Duration):
            Optional. The end offset of the video.
        fps (float):
            Optional. The frame rate of the video sent to the model. If
            not specified, the default value will be 1.0. The fps range
            is (0.0, 24.0].
    """

    start_offset: duration_pb2.Duration = proto.Field(
        proto.MESSAGE,
        number=1,
        message=duration_pb2.Duration,
    )
    end_offset: duration_pb2.Duration = proto.Field(
        proto.MESSAGE,
        number=2,
        message=duration_pb2.Duration,
    )
    fps: float = proto.Field(
        proto.DOUBLE,
        number=3,
    )


class PrebuiltVoiceConfig(proto.Message):
    r"""The configuration for the prebuilt speaker to use.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        voice_name (str):
            The name of the preset voice to use.

            This field is a member of `oneof`_ ``_voice_name``.
    """

    voice_name: str = proto.Field(
        proto.STRING,
        number=1,
        optional=True,
    )


class VoiceConfig(proto.Message):
    r"""The configuration for the voice to use.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        prebuilt_voice_config (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.PrebuiltVoiceConfig):
            The configuration for the prebuilt voice to
            use.

            This field is a member of `oneof`_ ``voice_config``.
    """

    prebuilt_voice_config: 'PrebuiltVoiceConfig' = proto.Field(
        proto.MESSAGE,
        number=1,
        oneof='voice_config',
        message='PrebuiltVoiceConfig',
    )


class SpeechConfig(proto.Message):
    r"""The speech generation config.

    Attributes:
        voice_config (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.VoiceConfig):
            The configuration for the speaker to use.
        language_code (str):
            Optional. Language code (ISO 639. e.g. en-US)
            for the speech synthesization.
    """

    voice_config: 'VoiceConfig' = proto.Field(
        proto.MESSAGE,
        number=1,
        message='VoiceConfig',
    )
    language_code: str = proto.Field(
        proto.STRING,
        number=2,
    )


class ProactivityConfig(proto.Message):
    r"""Config for proactivity features.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        proactive_audio (bool):
            Optional. If enabled, the model can reject
            responding to the last prompt. For example, this
            allows the model to ignore out of context speech
            or to stay silent if the user did not make a
            request, yet.

            This field is a member of `oneof`_ ``_proactive_audio``.
    """

    proactive_audio: bool = proto.Field(
        proto.BOOL,
        number=2,
        optional=True,
    )


class GenerationConfig(proto.Message):
    r"""Generation config.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        temperature (float):
            Optional. Controls the randomness of
            predictions.

            This field is a member of `oneof`_ ``_temperature``.
        top_p (float):
            Optional. If specified, nucleus sampling will
            be used.

            This field is a member of `oneof`_ ``_top_p``.
        top_k (float):
            Optional. If specified, top-k sampling will
            be used.

            This field is a member of `oneof`_ ``_top_k``.
        candidate_count (int):
            Optional. Number of candidates to generate.

            This field is a member of `oneof`_ ``_candidate_count``.
        max_output_tokens (int):
            Optional. The maximum number of output tokens
            to generate per message.

            This field is a member of `oneof`_ ``_max_output_tokens``.
        stop_sequences (MutableSequence[str]):
            Optional. Stop sequences.
        response_logprobs (bool):
            Optional. If true, export the logprobs
            results in response.

            This field is a member of `oneof`_ ``_response_logprobs``.
        logprobs (int):
            Optional. Logit probabilities.

            This field is a member of `oneof`_ ``_logprobs``.
        presence_penalty (float):
            Optional. Positive penalties.

            This field is a member of `oneof`_ ``_presence_penalty``.
        frequency_penalty (float):
            Optional. Frequency penalties.

            This field is a member of `oneof`_ ``_frequency_penalty``.
        seed (int):
            Optional. Seed.

            This field is a member of `oneof`_ ``_seed``.
        response_mime_type (str):
            Optional. Output response mimetype of the generated
            candidate text. Supported mimetype:

            -  ``text/plain``: (default) Text output.
            -  ``application/json``: JSON response in the candidates.
               The model needs to be prompted to output the appropriate
               response type, otherwise the behavior is undefined. This
               is a preview feature.
        response_schema (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.Schema):
            Optional. The ``Schema`` object allows the definition of
            input and output data types. These types can be objects, but
            also primitives and arrays. Represents a select subset of an
            `OpenAPI 3.0 schema
            object <https://spec.openapis.org/oas/v3.0.3#schema>`__. If
            set, a compatible response_mime_type must also be set.
            Compatible mimetypes: ``application/json``: Schema for JSON
            response.

            This field is a member of `oneof`_ ``_response_schema``.
        response_json_schema (google.protobuf.struct_pb2.Value):
            Optional. Output schema of the generated response. This is
            an alternative to ``response_schema`` that accepts `JSON
            Schema <https://json-schema.org/>`__.

            If set, ``response_schema`` must be omitted, but
            ``response_mime_type`` is required.

            While the full JSON Schema may be sent, not all features are
            supported. Specifically, only the following properties are
            supported:

            -  ``$id``
            -  ``$defs``
            -  ``$ref``
            -  ``$anchor``
            -  ``type``
            -  ``format``
            -  ``title``
            -  ``description``
            -  ``enum`` (for strings and numbers)
            -  ``items``
            -  ``prefixItems``
            -  ``minItems``
            -  ``maxItems``
            -  ``minimum``
            -  ``maximum``
            -  ``anyOf``
            -  ``oneOf`` (interpreted the same as ``anyOf``)
            -  ``properties``
            -  ``additionalProperties``
            -  ``required``

            The non-standard ``propertyOrdering`` property may also be
            set.

            Cyclic references are unrolled to a limited degree and, as
            such, may only be used within non-required properties.
            (Nullable properties are not sufficient.) If ``$ref`` is set
            on a sub-schema, no other properties, except for than those
            starting as a ``$``, may be set.

            This field is a member of `oneof`_ ``_response_json_schema``.
        routing_config (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.GenerationConfig.RoutingConfig):
            Optional. Routing configuration.

            This field is a member of `oneof`_ ``_routing_config``.
        audio_timestamp (bool):
            Optional. If enabled, audio timestamp will be
            included in the request to the model.

            This field is a member of `oneof`_ ``_audio_timestamp``.
        response_modalities (MutableSequence[googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.GenerationConfig.Modality]):
            Optional. The modalities of the response.
        media_resolution (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.GenerationConfig.MediaResolution):
            Optional. If specified, the media resolution
            specified will be used.

            This field is a member of `oneof`_ ``_media_resolution``.
        speech_config (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.SpeechConfig):
            Optional. The speech generation config.

            This field is a member of `oneof`_ ``_speech_config``.
        thinking_config (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.GenerationConfig.ThinkingConfig):
            Optional. Config for thinking features.
            An error will be returned if this field is set
            for models that don't support thinking.
        model_config (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.GenerationConfig.ModelConfig):
            Optional. Config for model selection.
        enable_affective_dialog (bool):
            Optional. If enabled, the model will detect
            emotions and adapt its responses accordingly.

            This field is a member of `oneof`_ ``_enable_affective_dialog``.
    """
    class Modality(proto.Enum):
        r"""The modalities of the response.

        Values:
            MODALITY_UNSPECIFIED (0):
                Unspecified modality. Will be processed as
                text.
            TEXT (1):
                Text modality.
            IMAGE (2):
                Image modality.
            AUDIO (3):
                Audio modality.
        """
        MODALITY_UNSPECIFIED = 0
        TEXT = 1
        IMAGE = 2
        AUDIO = 3

    class MediaResolution(proto.Enum):
        r"""Media resolution for the input media.

        Values:
            MEDIA_RESOLUTION_UNSPECIFIED (0):
                Media resolution has not been set.
            MEDIA_RESOLUTION_LOW (1):
                Media resolution set to low (64 tokens).
            MEDIA_RESOLUTION_MEDIUM (2):
                Media resolution set to medium (256 tokens).
            MEDIA_RESOLUTION_HIGH (3):
                Media resolution set to high (zoomed
                reframing with 256 tokens).
        """
        MEDIA_RESOLUTION_UNSPECIFIED = 0
        MEDIA_RESOLUTION_LOW = 1
        MEDIA_RESOLUTION_MEDIUM = 2
        MEDIA_RESOLUTION_HIGH = 3

    class RoutingConfig(proto.Message):
        r"""The configuration for routing the request to a specific
        model.

        This message has `oneof`_ fields (mutually exclusive fields).
        For each oneof, at most one member field can be set at the same time.
        Setting any member of the oneof automatically clears all other
        members.

        .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

        Attributes:
            auto_mode (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.GenerationConfig.RoutingConfig.AutoRoutingMode):
                Automated routing.

                This field is a member of `oneof`_ ``routing_config``.
            manual_mode (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.GenerationConfig.RoutingConfig.ManualRoutingMode):
                Manual routing.

                This field is a member of `oneof`_ ``routing_config``.
        """

        class AutoRoutingMode(proto.Message):
            r"""When automated routing is specified, the routing will be
            determined by the pretrained routing model and customer provided
            model routing preference.


            .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

            Attributes:
                model_routing_preference (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.GenerationConfig.RoutingConfig.AutoRoutingMode.ModelRoutingPreference):
                    The model routing preference.

                    This field is a member of `oneof`_ ``_model_routing_preference``.
            """
            class ModelRoutingPreference(proto.Enum):
                r"""The model routing preference.

                Values:
                    UNKNOWN (0):
                        Unspecified model routing preference.
                    PRIORITIZE_QUALITY (1):
                        Prefer higher quality over low cost.
                    BALANCED (2):
                        Balanced model routing preference.
                    PRIORITIZE_COST (3):
                        Prefer lower cost over higher quality.
                """
                UNKNOWN = 0
                PRIORITIZE_QUALITY = 1
                BALANCED = 2
                PRIORITIZE_COST = 3

            model_routing_preference: 'GenerationConfig.RoutingConfig.AutoRoutingMode.ModelRoutingPreference' = proto.Field(
                proto.ENUM,
                number=1,
                optional=True,
                enum='GenerationConfig.RoutingConfig.AutoRoutingMode.ModelRoutingPreference',
            )

        class ManualRoutingMode(proto.Message):
            r"""When manual routing is set, the specified model will be used
            directly.


            .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

            Attributes:
                model_name (str):
                    The model name to use. Only the public LLM models are
                    accepted. See `Supported
                    models <https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/inference#supported-models>`__.

                    This field is a member of `oneof`_ ``_model_name``.
            """

            model_name: str = proto.Field(
                proto.STRING,
                number=1,
                optional=True,
            )

        auto_mode: 'GenerationConfig.RoutingConfig.AutoRoutingMode' = proto.Field(
            proto.MESSAGE,
            number=1,
            oneof='routing_config',
            message='GenerationConfig.RoutingConfig.AutoRoutingMode',
        )
        manual_mode: 'GenerationConfig.RoutingConfig.ManualRoutingMode' = proto.Field(
            proto.MESSAGE,
            number=2,
            oneof='routing_config',
            message='GenerationConfig.RoutingConfig.ManualRoutingMode',
        )

    class ThinkingConfig(proto.Message):
        r"""Config for thinking features.

        .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

        Attributes:
            include_thoughts (bool):
                Optional. Indicates whether to include
                thoughts in the response. If true, thoughts are
                returned only when available.

                This field is a member of `oneof`_ ``_include_thoughts``.
            thinking_budget (int):
                Optional. Indicates the thinking budget in
                tokens.

                This field is a member of `oneof`_ ``_thinking_budget``.
        """

        include_thoughts: bool = proto.Field(
            proto.BOOL,
            number=1,
            optional=True,
        )
        thinking_budget: int = proto.Field(
            proto.INT32,
            number=3,
            optional=True,
        )

    class ModelConfig(proto.Message):
        r"""Config for model selection.

        Attributes:
            feature_selection_preference (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.GenerationConfig.ModelConfig.FeatureSelectionPreference):
                Required. Feature selection preference.
        """
        class FeatureSelectionPreference(proto.Enum):
            r"""Options for feature selection preference.

            Values:
                FEATURE_SELECTION_PREFERENCE_UNSPECIFIED (0):
                    Unspecified feature selection preference.
                PRIORITIZE_QUALITY (1):
                    Prefer higher quality over lower cost.
                BALANCED (2):
                    Balanced feature selection preference.
                PRIORITIZE_COST (3):
                    Prefer lower cost over higher quality.
            """
            FEATURE_SELECTION_PREFERENCE_UNSPECIFIED = 0
            PRIORITIZE_QUALITY = 1
            BALANCED = 2
            PRIORITIZE_COST = 3

        feature_selection_preference: 'GenerationConfig.ModelConfig.FeatureSelectionPreference' = proto.Field(
            proto.ENUM,
            number=1,
            enum='GenerationConfig.ModelConfig.FeatureSelectionPreference',
        )

    temperature: float = proto.Field(
        proto.FLOAT,
        number=1,
        optional=True,
    )
    top_p: float = proto.Field(
        proto.FLOAT,
        number=2,
        optional=True,
    )
    top_k: float = proto.Field(
        proto.FLOAT,
        number=3,
        optional=True,
    )
    candidate_count: int = proto.Field(
        proto.INT32,
        number=4,
        optional=True,
    )
    max_output_tokens: int = proto.Field(
        proto.INT32,
        number=5,
        optional=True,
    )
    stop_sequences: MutableSequence[str] = proto.RepeatedField(
        proto.STRING,
        number=6,
    )
    response_logprobs: bool = proto.Field(
        proto.BOOL,
        number=18,
        optional=True,
    )
    logprobs: int = proto.Field(
        proto.INT32,
        number=7,
        optional=True,
    )
    presence_penalty: float = proto.Field(
        proto.FLOAT,
        number=8,
        optional=True,
    )
    frequency_penalty: float = proto.Field(
        proto.FLOAT,
        number=9,
        optional=True,
    )
    seed: int = proto.Field(
        proto.INT32,
        number=12,
        optional=True,
    )
    response_mime_type: str = proto.Field(
        proto.STRING,
        number=13,
    )
    response_schema: openapi.Schema = proto.Field(
        proto.MESSAGE,
        number=16,
        optional=True,
        message=openapi.Schema,
    )
    response_json_schema: struct_pb2.Value = proto.Field(
        proto.MESSAGE,
        number=28,
        optional=True,
        message=struct_pb2.Value,
    )
    routing_config: RoutingConfig = proto.Field(
        proto.MESSAGE,
        number=17,
        optional=True,
        message=RoutingConfig,
    )
    audio_timestamp: bool = proto.Field(
        proto.BOOL,
        number=20,
        optional=True,
    )
    response_modalities: MutableSequence[Modality] = proto.RepeatedField(
        proto.ENUM,
        number=21,
        enum=Modality,
    )
    media_resolution: MediaResolution = proto.Field(
        proto.ENUM,
        number=22,
        optional=True,
        enum=MediaResolution,
    )
    speech_config: 'SpeechConfig' = proto.Field(
        proto.MESSAGE,
        number=23,
        optional=True,
        message='SpeechConfig',
    )
    thinking_config: ThinkingConfig = proto.Field(
        proto.MESSAGE,
        number=25,
        message=ThinkingConfig,
    )
    model_config: ModelConfig = proto.Field(
        proto.MESSAGE,
        number=27,
        message=ModelConfig,
    )
    enable_affective_dialog: bool = proto.Field(
        proto.BOOL,
        number=29,
        optional=True,
    )


class SafetySetting(proto.Message):
    r"""Safety settings.

    Attributes:
        category (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.HarmCategory):
            Required. Harm category.
        threshold (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.SafetySetting.HarmBlockThreshold):
            Required. The harm block threshold.
        method (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.SafetySetting.HarmBlockMethod):
            Optional. Specify if the threshold is used
            for probability or severity score. If not
            specified, the threshold is used for probability
            score.
    """
    class HarmBlockThreshold(proto.Enum):
        r"""Probability based thresholds levels for blocking.

        Values:
            HARM_BLOCK_THRESHOLD_UNSPECIFIED (0):
                Unspecified harm block threshold.
            BLOCK_LOW_AND_ABOVE (1):
                Block low threshold and above (i.e. block
                more).
            BLOCK_MEDIUM_AND_ABOVE (2):
                Block medium threshold and above.
            BLOCK_ONLY_HIGH (3):
                Block only high threshold (i.e. block less).
            BLOCK_NONE (4):
                Block none.
            OFF (5):
                Turn off the safety filter.
        """
        HARM_BLOCK_THRESHOLD_UNSPECIFIED = 0
        BLOCK_LOW_AND_ABOVE = 1
        BLOCK_MEDIUM_AND_ABOVE = 2
        BLOCK_ONLY_HIGH = 3
        BLOCK_NONE = 4
        OFF = 5

    class HarmBlockMethod(proto.Enum):
        r"""Probability vs severity.

        Values:
            HARM_BLOCK_METHOD_UNSPECIFIED (0):
                The harm block method is unspecified.
            SEVERITY (1):
                The harm block method uses both probability
                and severity scores.
            PROBABILITY (2):
                The harm block method uses the probability
                score.
        """
        HARM_BLOCK_METHOD_UNSPECIFIED = 0
        SEVERITY = 1
        PROBABILITY = 2

    category: 'HarmCategory' = proto.Field(
        proto.ENUM,
        number=1,
        enum='HarmCategory',
    )
    threshold: HarmBlockThreshold = proto.Field(
        proto.ENUM,
        number=2,
        enum=HarmBlockThreshold,
    )
    method: HarmBlockMethod = proto.Field(
        proto.ENUM,
        number=4,
        enum=HarmBlockMethod,
    )


class SafetyRating(proto.Message):
    r"""Safety rating corresponding to the generated content.

    Attributes:
        category (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.HarmCategory):
            Output only. Harm category.
        probability (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.SafetyRating.HarmProbability):
            Output only. Harm probability levels in the
            content.
        probability_score (float):
            Output only. Harm probability score.
        severity (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.SafetyRating.HarmSeverity):
            Output only. Harm severity levels in the
            content.
        severity_score (float):
            Output only. Harm severity score.
        blocked (bool):
            Output only. Indicates whether the content
            was filtered out because of this rating.
        overwritten_threshold (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.SafetySetting.HarmBlockThreshold):
            Output only. The overwritten threshold for
            the safety category of Gemini 2.0 image out. If
            minors are detected in the output image, the
            threshold of each safety category will be
            overwritten if user sets a lower threshold.
    """
    class HarmProbability(proto.Enum):
        r"""Harm probability levels in the content.

        Values:
            HARM_PROBABILITY_UNSPECIFIED (0):
                Harm probability unspecified.
            NEGLIGIBLE (1):
                Negligible level of harm.
            LOW (2):
                Low level of harm.
            MEDIUM (3):
                Medium level of harm.
            HIGH (4):
                High level of harm.
        """
        HARM_PROBABILITY_UNSPECIFIED = 0
        NEGLIGIBLE = 1
        LOW = 2
        MEDIUM = 3
        HIGH = 4

    class HarmSeverity(proto.Enum):
        r"""Harm severity levels.

        Values:
            HARM_SEVERITY_UNSPECIFIED (0):
                Harm severity unspecified.
            HARM_SEVERITY_NEGLIGIBLE (1):
                Negligible level of harm severity.
            HARM_SEVERITY_LOW (2):
                Low level of harm severity.
            HARM_SEVERITY_MEDIUM (3):
                Medium level of harm severity.
            HARM_SEVERITY_HIGH (4):
                High level of harm severity.
        """
        HARM_SEVERITY_UNSPECIFIED = 0
        HARM_SEVERITY_NEGLIGIBLE = 1
        HARM_SEVERITY_LOW = 2
        HARM_SEVERITY_MEDIUM = 3
        HARM_SEVERITY_HIGH = 4

    category: 'HarmCategory' = proto.Field(
        proto.ENUM,
        number=1,
        enum='HarmCategory',
    )
    probability: HarmProbability = proto.Field(
        proto.ENUM,
        number=2,
        enum=HarmProbability,
    )
    probability_score: float = proto.Field(
        proto.FLOAT,
        number=5,
    )
    severity: HarmSeverity = proto.Field(
        proto.ENUM,
        number=6,
        enum=HarmSeverity,
    )
    severity_score: float = proto.Field(
        proto.FLOAT,
        number=7,
    )
    blocked: bool = proto.Field(
        proto.BOOL,
        number=3,
    )
    overwritten_threshold: 'SafetySetting.HarmBlockThreshold' = proto.Field(
        proto.ENUM,
        number=8,
        enum='SafetySetting.HarmBlockThreshold',
    )


class CitationMetadata(proto.Message):
    r"""A collection of source attributions for a piece of content.

    Attributes:
        citations (MutableSequence[googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.Citation]):
            Output only. List of citations.
    """

    citations: MutableSequence['Citation'] = proto.RepeatedField(
        proto.MESSAGE,
        number=1,
        message='Citation',
    )


class Citation(proto.Message):
    r"""Source attributions for content.

    Attributes:
        start_index (int):
            Output only. Start index into the content.
        end_index (int):
            Output only. End index into the content.
        uri (str):
            Output only. Url reference of the
            attribution.
        title (str):
            Output only. Title of the attribution.
        license_ (str):
            Output only. License of the attribution.
        publication_date (google.type.date_pb2.Date):
            Output only. Publication date of the
            attribution.
    """

    start_index: int = proto.Field(
        proto.INT32,
        number=1,
    )
    end_index: int = proto.Field(
        proto.INT32,
        number=2,
    )
    uri: str = proto.Field(
        proto.STRING,
        number=3,
    )
    title: str = proto.Field(
        proto.STRING,
        number=4,
    )
    license_: str = proto.Field(
        proto.STRING,
        number=5,
    )
    publication_date: date_pb2.Date = proto.Field(
        proto.MESSAGE,
        number=6,
        message=date_pb2.Date,
    )


class Candidate(proto.Message):
    r"""A response candidate generated from the model.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        index (int):
            Output only. Index of the candidate.
        content (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.Content):
            Output only. Content parts of the candidate.
        avg_logprobs (float):
            Output only. Average log probability score of
            the candidate.
        logprobs_result (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.LogprobsResult):
            Output only. Log-likelihood scores for the
            response tokens and top tokens
        finish_reason (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.Candidate.FinishReason):
            Output only. The reason why the model stopped
            generating tokens. If empty, the model has not
            stopped generating the tokens.
        safety_ratings (MutableSequence[googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.SafetyRating]):
            Output only. List of ratings for the safety
            of a response candidate.
            There is at most one rating per category.
        finish_message (str):
            Output only. Describes the reason the mode stopped
            generating tokens in more detail. This is only filled when
            ``finish_reason`` is set.

            This field is a member of `oneof`_ ``_finish_message``.
        citation_metadata (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.CitationMetadata):
            Output only. Source attribution of the
            generated content.
        grounding_metadata (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.GroundingMetadata):
            Output only. Metadata specifies sources used
            to ground generated content.
        url_context_metadata (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.UrlContextMetadata):
            Output only. Metadata related to url context
            retrieval tool.
    """
    class FinishReason(proto.Enum):
        r"""The reason why the model stopped generating tokens.
        If empty, the model has not stopped generating the tokens.

        Values:
            FINISH_REASON_UNSPECIFIED (0):
                The finish reason is unspecified.
            STOP (1):
                Token generation reached a natural stopping
                point or a configured stop sequence.
            MAX_TOKENS (2):
                Token generation reached the configured
                maximum output tokens.
            SAFETY (3):
                Token generation stopped because the content potentially
                contains safety violations. NOTE: When streaming,
                [content][google.cloud.aiplatform.v1beta1.Candidate.content]
                is empty if content filters blocks the output.
            RECITATION (4):
                The token generation stopped because of
                potential recitation.
            OTHER (5):
                All other reasons that stopped the token
                generation.
            BLOCKLIST (6):
                Token generation stopped because the content
                contains forbidden terms.
            PROHIBITED_CONTENT (7):
                Token generation stopped for potentially
                containing prohibited content.
            SPII (8):
                Token generation stopped because the content
                potentially contains Sensitive Personally
                Identifiable Information (SPII).
            MALFORMED_FUNCTION_CALL (9):
                The function call generated by the model is
                invalid.
            IMAGE_SAFETY (11):
                Token generation stopped because generated
                images has safety violations.
            IMAGE_PROHIBITED_CONTENT (12):
                Image generation stopped because generated
                images has other prohibited content.
            IMAGE_RECITATION (13):
                Image generation stopped due to recitation.
            IMAGE_OTHER (14):
                Image generation stopped because of other
                miscellaneous issue.
            UNEXPECTED_TOOL_CALL (15):
                The tool call generated by the model is
                invalid.
        """
        FINISH_REASON_UNSPECIFIED = 0
        STOP = 1
        MAX_TOKENS = 2
        SAFETY = 3
        RECITATION = 4
        OTHER = 5
        BLOCKLIST = 6
        PROHIBITED_CONTENT = 7
        SPII = 8
        MALFORMED_FUNCTION_CALL = 9
        IMAGE_SAFETY = 11
        IMAGE_PROHIBITED_CONTENT = 12
        IMAGE_RECITATION = 13
        IMAGE_OTHER = 14
        UNEXPECTED_TOOL_CALL = 15

    index: int = proto.Field(
        proto.INT32,
        number=1,
    )
    content: 'Content' = proto.Field(
        proto.MESSAGE,
        number=2,
        message='Content',
    )
    avg_logprobs: float = proto.Field(
        proto.DOUBLE,
        number=9,
    )
    logprobs_result: 'LogprobsResult' = proto.Field(
        proto.MESSAGE,
        number=10,
        message='LogprobsResult',
    )
    finish_reason: FinishReason = proto.Field(
        proto.ENUM,
        number=3,
        enum=FinishReason,
    )
    safety_ratings: MutableSequence['SafetyRating'] = proto.RepeatedField(
        proto.MESSAGE,
        number=4,
        message='SafetyRating',
    )
    finish_message: str = proto.Field(
        proto.STRING,
        number=5,
        optional=True,
    )
    citation_metadata: 'CitationMetadata' = proto.Field(
        proto.MESSAGE,
        number=6,
        message='CitationMetadata',
    )
    grounding_metadata: 'GroundingMetadata' = proto.Field(
        proto.MESSAGE,
        number=7,
        message='GroundingMetadata',
    )
    url_context_metadata: 'UrlContextMetadata' = proto.Field(
        proto.MESSAGE,
        number=13,
        message='UrlContextMetadata',
    )


class UrlContextMetadata(proto.Message):
    r"""Metadata related to url context retrieval tool.

    Attributes:
        url_metadata (MutableSequence[googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.UrlMetadata]):
            Output only. List of url context.
    """

    url_metadata: MutableSequence['UrlMetadata'] = proto.RepeatedField(
        proto.MESSAGE,
        number=1,
        message='UrlMetadata',
    )


class UrlMetadata(proto.Message):
    r"""Context of the a single url retrieval.

    Attributes:
        retrieved_url (str):
            Retrieved url by the tool.
        url_retrieval_status (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.UrlMetadata.UrlRetrievalStatus):
            Status of the url retrieval.
    """
    class UrlRetrievalStatus(proto.Enum):
        r"""Status of the url retrieval.

        Values:
            URL_RETRIEVAL_STATUS_UNSPECIFIED (0):
                Default value. This value is unused.
            URL_RETRIEVAL_STATUS_SUCCESS (1):
                Url retrieval is successful.
            URL_RETRIEVAL_STATUS_ERROR (2):
                Url retrieval is failed due to error.
        """
        URL_RETRIEVAL_STATUS_UNSPECIFIED = 0
        URL_RETRIEVAL_STATUS_SUCCESS = 1
        URL_RETRIEVAL_STATUS_ERROR = 2

    retrieved_url: str = proto.Field(
        proto.STRING,
        number=1,
    )
    url_retrieval_status: UrlRetrievalStatus = proto.Field(
        proto.ENUM,
        number=2,
        enum=UrlRetrievalStatus,
    )


class LogprobsResult(proto.Message):
    r"""Logprobs Result

    Attributes:
        top_candidates (MutableSequence[googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.LogprobsResult.TopCandidates]):
            Length = total number of decoding steps.
        chosen_candidates (MutableSequence[googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.LogprobsResult.Candidate]):
            Length = total number of decoding steps. The chosen
            candidates may or may not be in top_candidates.
    """

    class Candidate(proto.Message):
        r"""Candidate for the logprobs token and score.

        .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

        Attributes:
            token (str):
                The candidate's token string value.

                This field is a member of `oneof`_ ``_token``.
            token_id (int):
                The candidate's token id value.

                This field is a member of `oneof`_ ``_token_id``.
            log_probability (float):
                The candidate's log probability.

                This field is a member of `oneof`_ ``_log_probability``.
        """

        token: str = proto.Field(
            proto.STRING,
            number=1,
            optional=True,
        )
        token_id: int = proto.Field(
            proto.INT32,
            number=3,
            optional=True,
        )
        log_probability: float = proto.Field(
            proto.FLOAT,
            number=2,
            optional=True,
        )

    class TopCandidates(proto.Message):
        r"""Candidates with top log probabilities at each decoding step.

        Attributes:
            candidates (MutableSequence[googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.LogprobsResult.Candidate]):
                Sorted by log probability in descending
                order.
        """

        candidates: MutableSequence['LogprobsResult.Candidate'] = proto.RepeatedField(
            proto.MESSAGE,
            number=1,
            message='LogprobsResult.Candidate',
        )

    top_candidates: MutableSequence[TopCandidates] = proto.RepeatedField(
        proto.MESSAGE,
        number=1,
        message=TopCandidates,
    )
    chosen_candidates: MutableSequence[Candidate] = proto.RepeatedField(
        proto.MESSAGE,
        number=2,
        message=Candidate,
    )


class Segment(proto.Message):
    r"""Segment of the content.

    Attributes:
        part_index (int):
            Output only. The index of a Part object
            within its parent Content object.
        start_index (int):
            Output only. Start index in the given Part,
            measured in bytes. Offset from the start of the
            Part, inclusive, starting at zero.
        end_index (int):
            Output only. End index in the given Part,
            measured in bytes. Offset from the start of the
            Part, exclusive, starting at zero.
        text (str):
            Output only. The text corresponding to the
            segment from the response.
    """

    part_index: int = proto.Field(
        proto.INT32,
        number=1,
    )
    start_index: int = proto.Field(
        proto.INT32,
        number=2,
    )
    end_index: int = proto.Field(
        proto.INT32,
        number=3,
    )
    text: str = proto.Field(
        proto.STRING,
        number=4,
    )


class GroundingChunk(proto.Message):
    r"""Grounding chunk.

    This message has `oneof`_ fields (mutually exclusive fields).
    For each oneof, at most one member field can be set at the same time.
    Setting any member of the oneof automatically clears all other
    members.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        web (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.GroundingChunk.Web):
            Grounding chunk from the web.

            This field is a member of `oneof`_ ``chunk_type``.
        retrieved_context (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.GroundingChunk.RetrievedContext):
            Grounding chunk from context retrieved by the
            retrieval tools.

            This field is a member of `oneof`_ ``chunk_type``.
        maps (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.GroundingChunk.Maps):
            Grounding chunk from Google Maps.

            This field is a member of `oneof`_ ``chunk_type``.
    """

    class Web(proto.Message):
        r"""Chunk from the web.

        .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

        Attributes:
            uri (str):
                URI reference of the chunk.

                This field is a member of `oneof`_ ``_uri``.
            title (str):
                Title of the chunk.

                This field is a member of `oneof`_ ``_title``.
            domain (str):
                Domain of the (original) URI.

                This field is a member of `oneof`_ ``_domain``.
        """

        uri: str = proto.Field(
            proto.STRING,
            number=1,
            optional=True,
        )
        title: str = proto.Field(
            proto.STRING,
            number=2,
            optional=True,
        )
        domain: str = proto.Field(
            proto.STRING,
            number=3,
            optional=True,
        )

    class RetrievedContext(proto.Message):
        r"""Chunk from context retrieved by the retrieval tools.

        .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

        Attributes:
            rag_chunk (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.RagChunk):
                Additional context for the RAG retrieval
                result. This is only populated when using the
                RAG retrieval tool.

                This field is a member of `oneof`_ ``context_details``.
            uri (str):
                URI reference of the attribution.

                This field is a member of `oneof`_ ``_uri``.
            title (str):
                Title of the attribution.

                This field is a member of `oneof`_ ``_title``.
            text (str):
                Text of the attribution.

                This field is a member of `oneof`_ ``_text``.
        """

        rag_chunk: vertex_rag_data.RagChunk = proto.Field(
            proto.MESSAGE,
            number=4,
            oneof='context_details',
            message=vertex_rag_data.RagChunk,
        )
        uri: str = proto.Field(
            proto.STRING,
            number=1,
            optional=True,
        )
        title: str = proto.Field(
            proto.STRING,
            number=2,
            optional=True,
        )
        text: str = proto.Field(
            proto.STRING,
            number=3,
            optional=True,
        )

    class Maps(proto.Message):
        r"""Chunk from Google Maps.

        .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

        Attributes:
            uri (str):
                URI reference of the chunk.

                This field is a member of `oneof`_ ``_uri``.
            title (str):
                Title of the chunk.

                This field is a member of `oneof`_ ``_title``.
            text (str):
                Text of the chunk.

                This field is a member of `oneof`_ ``_text``.
            place_id (str):
                This Place's resource name, in ``places/{place_id}`` format.
                Can be used to look up the Place.

                This field is a member of `oneof`_ ``_place_id``.
            place_answer_sources (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.GroundingChunk.Maps.PlaceAnswerSources):
                Sources used to generate the place answer.
                This includes review snippets and photos that
                were used to generate the answer, as well as
                uris to flag content.
        """

        class PlaceAnswerSources(proto.Message):
            r"""Sources used to generate the place answer.

            Attributes:
                review_snippets (MutableSequence[googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.GroundingChunk.Maps.PlaceAnswerSources.ReviewSnippet]):
                    Snippets of reviews that are used to generate
                    the answer.
                flag_content_uri (str):
                    A link where users can flag a problem with
                    the generated answer.
            """

            class AuthorAttribution(proto.Message):
                r"""Author attribution for a photo or review.

                Attributes:
                    display_name (str):
                        Name of the author of the Photo or Review.
                    uri (str):
                        URI of the author of the Photo or Review.
                    photo_uri (str):
                        Profile photo URI of the author of the Photo
                        or Review.
                """

                display_name: str = proto.Field(
                    proto.STRING,
                    number=1,
                )
                uri: str = proto.Field(
                    proto.STRING,
                    number=2,
                )
                photo_uri: str = proto.Field(
                    proto.STRING,
                    number=3,
                )

            class ReviewSnippet(proto.Message):
                r"""Encapsulates a review snippet.

                Attributes:
                    review (str):
                        A reference representing this place review
                        which may be used to look up this place review
                        again.
                    author_attribution (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.GroundingChunk.Maps.PlaceAnswerSources.AuthorAttribution):
                        This review's author.
                    relative_publish_time_description (str):
                        A string of formatted recent time, expressing
                        the review time relative to the current time in
                        a form appropriate for the language and country.
                    flag_content_uri (str):
                        A link where users can flag a problem with
                        the review.
                    google_maps_uri (str):
                        A link to show the review on Google Maps.
                """

                review: str = proto.Field(
                    proto.STRING,
                    number=1,
                )
                author_attribution: 'GroundingChunk.Maps.PlaceAnswerSources.AuthorAttribution' = proto.Field(
                    proto.MESSAGE,
                    number=4,
                    message='GroundingChunk.Maps.PlaceAnswerSources.AuthorAttribution',
                )
                relative_publish_time_description: str = proto.Field(
                    proto.STRING,
                    number=5,
                )
                flag_content_uri: str = proto.Field(
                    proto.STRING,
                    number=6,
                )
                google_maps_uri: str = proto.Field(
                    proto.STRING,
                    number=7,
                )

            review_snippets: MutableSequence['GroundingChunk.Maps.PlaceAnswerSources.ReviewSnippet'] = proto.RepeatedField(
                proto.MESSAGE,
                number=1,
                message='GroundingChunk.Maps.PlaceAnswerSources.ReviewSnippet',
            )
            flag_content_uri: str = proto.Field(
                proto.STRING,
                number=3,
            )

        uri: str = proto.Field(
            proto.STRING,
            number=1,
            optional=True,
        )
        title: str = proto.Field(
            proto.STRING,
            number=2,
            optional=True,
        )
        text: str = proto.Field(
            proto.STRING,
            number=3,
            optional=True,
        )
        place_id: str = proto.Field(
            proto.STRING,
            number=4,
            optional=True,
        )
        place_answer_sources: 'GroundingChunk.Maps.PlaceAnswerSources' = proto.Field(
            proto.MESSAGE,
            number=5,
            message='GroundingChunk.Maps.PlaceAnswerSources',
        )

    web: Web = proto.Field(
        proto.MESSAGE,
        number=1,
        oneof='chunk_type',
        message=Web,
    )
    retrieved_context: RetrievedContext = proto.Field(
        proto.MESSAGE,
        number=2,
        oneof='chunk_type',
        message=RetrievedContext,
    )
    maps: Maps = proto.Field(
        proto.MESSAGE,
        number=3,
        oneof='chunk_type',
        message=Maps,
    )


class GroundingSupport(proto.Message):
    r"""Grounding support.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        segment (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.Segment):
            Segment of the content this support belongs
            to.

            This field is a member of `oneof`_ ``_segment``.
        grounding_chunk_indices (MutableSequence[int]):
            A list of indices (into 'grounding_chunk') specifying the
            citations associated with the claim. For instance [1,3,4]
            means that grounding_chunk[1], grounding_chunk[3],
            grounding_chunk[4] are the retrieved content attributed to
            the claim.
        confidence_scores (MutableSequence[float]):
            Confidence score of the support references. Ranges from 0 to
            1. 1 is the most confident. For Gemini 2.0 and before, this
            list must have the same size as the grounding_chunk_indices.
            For Gemini 2.5 and after, this list will be empty and should
            be ignored.
    """

    segment: 'Segment' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='Segment',
    )
    grounding_chunk_indices: MutableSequence[int] = proto.RepeatedField(
        proto.INT32,
        number=2,
    )
    confidence_scores: MutableSequence[float] = proto.RepeatedField(
        proto.FLOAT,
        number=3,
    )


class GroundingMetadata(proto.Message):
    r"""Metadata returned to client when grounding is enabled.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        web_search_queries (MutableSequence[str]):
            Optional. Web search queries for the
            following-up web search.
        search_entry_point (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.SearchEntryPoint):
            Optional. Google search entry for the
            following-up web searches.

            This field is a member of `oneof`_ ``_search_entry_point``.
        retrieval_queries (MutableSequence[str]):
            Optional. Queries executed by the retrieval
            tools.
        grounding_chunks (MutableSequence[googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.GroundingChunk]):
            List of supporting references retrieved from
            specified grounding source.
        grounding_supports (MutableSequence[googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.GroundingSupport]):
            Optional. List of grounding support.
        retrieval_metadata (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.RetrievalMetadata):
            Optional. Output only. Retrieval metadata.

            This field is a member of `oneof`_ ``_retrieval_metadata``.
        google_maps_widget_context_token (str):
            Optional. Output only. Resource name of the
            Google Maps widget context token to be used with
            the PlacesContextElement widget to render
            contextual data. This is populated only for
            Google Maps grounding.

            This field is a member of `oneof`_ ``_google_maps_widget_context_token``.
    """

    web_search_queries: MutableSequence[str] = proto.RepeatedField(
        proto.STRING,
        number=1,
    )
    search_entry_point: 'SearchEntryPoint' = proto.Field(
        proto.MESSAGE,
        number=4,
        optional=True,
        message='SearchEntryPoint',
    )
    retrieval_queries: MutableSequence[str] = proto.RepeatedField(
        proto.STRING,
        number=3,
    )
    grounding_chunks: MutableSequence['GroundingChunk'] = proto.RepeatedField(
        proto.MESSAGE,
        number=5,
        message='GroundingChunk',
    )
    grounding_supports: MutableSequence['GroundingSupport'] = proto.RepeatedField(
        proto.MESSAGE,
        number=6,
        message='GroundingSupport',
    )
    retrieval_metadata: 'RetrievalMetadata' = proto.Field(
        proto.MESSAGE,
        number=7,
        optional=True,
        message='RetrievalMetadata',
    )
    google_maps_widget_context_token: str = proto.Field(
        proto.STRING,
        number=8,
        optional=True,
    )


class SearchEntryPoint(proto.Message):
    r"""Google search entry point.

    Attributes:
        rendered_content (str):
            Optional. Web content snippet that can be
            embedded in a web page or an app webview.
        sdk_blob (bytes):
            Optional. Base64 encoded JSON representing
            array of <search term, search url> tuple.
    """

    rendered_content: str = proto.Field(
        proto.STRING,
        number=1,
    )
    sdk_blob: bytes = proto.Field(
        proto.BYTES,
        number=2,
    )


class RetrievalMetadata(proto.Message):
    r"""Metadata related to retrieval in the grounding flow.

    Attributes:
        google_search_dynamic_retrieval_score (float):
            Optional. Score indicating how likely information from
            Google Search could help answer the prompt. The score is in
            the range ``[0, 1]``, where 0 is the least likely and 1 is
            the most likely. This score is only populated when Google
            Search grounding and dynamic retrieval is enabled. It will
            be compared to the threshold to determine whether to trigger
            Google Search.
    """

    google_search_dynamic_retrieval_score: float = proto.Field(
        proto.FLOAT,
        number=2,
    )


class ModalityTokenCount(proto.Message):
    r"""Represents token counting info for a single modality.

    Attributes:
        modality (googlecloudsdk.generated_clients.gapic_clients.aiplatform_v1beta1.types.Modality):
            The modality associated with this token
            count.
        token_count (int):
            Number of tokens.
    """

    modality: 'Modality' = proto.Field(
        proto.ENUM,
        number=1,
        enum='Modality',
    )
    token_count: int = proto.Field(
        proto.INT32,
        number=2,
    )


__all__ = tuple(sorted(__protobuf__.manifest))

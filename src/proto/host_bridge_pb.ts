import { fileDesc, messageDesc, serviceDesc } from '@bufbuild/protobuf/codegenv2';

/**
 * Describes the file host_bridge.proto.
 */
export const file_host_bridge = fileDesc(
  'ChFob3N0X2JyaWRnZS5wcm90bxISZXhhLmhvc3RfYnJpZGdlX3BiIhgKFkdldFVwZGF0ZVN0YXR1c1JlcXVlc3QiSwoXR2V0VXBkYXRlU3RhdHVzUmVzcG9uc2USMAoGc3RhdHVzGAEgASgLMiAuZXhhLmhvc3RfYnJpZGdlX3BiLlVwZGF0ZVN0YXR1cyJZCgxVcGRhdGVTdGF0dXMSFwoPY3VycmVudF92ZXJzaW9uGAEgASgJEhYKDmxhdGVzdF92ZXJzaW9uGAIgASgJEhgKEHVwZGF0ZV9hdmFpbGFibGUYAyABKAgiFAoSQXBwbHlVcGRhdGVSZXF1ZXN0IicKE0FwcGx5VXBkYXRlUmVzcG9uc2USEAoIYWNjZXB0ZWQYASABKAgy3wEKEUhvc3RCcmlkZ2VTZXJ2aWNlEmoKD0dldFVwZGF0ZVN0YXR1cxIqLmV4YS5ob3N0X2JyaWRnZV9wYi5HZXRVcGRhdGVTdGF0dXNSZXF1ZXN0GisuZXhhLmhvc3RfYnJpZGdlX3BiLkdldFVwZGF0ZVN0YXR1c1Jlc3BvbnNlEl4KC0FwcGx5VXBkYXRlEiYuZXhhLmhvc3RfYnJpZGdlX3BiLkFwcGx5VXBkYXRlUmVxdWVzdBonLmV4YS5ob3N0X2JyaWRnZV9wYi5BcHBseVVwZGF0ZVJlc3BvbnNlYgZwcm90bzM',
);

/**
 * Describes the message exa.host_bridge_pb.GetUpdateStatusRequest.
 */
export const GetUpdateStatusRequestSchema = messageDesc(file_host_bridge, 0);

/**
 * Describes the message exa.host_bridge_pb.GetUpdateStatusResponse.
 */
export const GetUpdateStatusResponseSchema = messageDesc(file_host_bridge, 1);

/**
 * Describes the message exa.host_bridge_pb.UpdateStatus.
 */
export const UpdateStatusSchema = messageDesc(file_host_bridge, 2);

/**
 * Describes the message exa.host_bridge_pb.ApplyUpdateRequest.
 */
export const ApplyUpdateRequestSchema = messageDesc(file_host_bridge, 3);

/**
 * Describes the message exa.host_bridge_pb.ApplyUpdateResponse.
 */
export const ApplyUpdateResponseSchema = messageDesc(file_host_bridge, 4);

/**
 * @generated from service exa.host_bridge_pb.HostBridgeService
 */
export const HostBridgeService = serviceDesc(file_host_bridge, 0);

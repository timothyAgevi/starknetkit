import { InvokeFunctionResponse, Signature } from "starknet"
import { z } from "zod"

const HEX_REGEX = /^0x[0-9a-f]+$/i
const DECIMAL_REGEX = /^\d+$/

const shortStringSchema = z
  .string()
  .nonempty("The short string cannot be empty")
  .max(31, "The short string cannot exceed 31 characters")
  .refine(
    (value) => !HEX_REGEX.test(value),
    "The shortString should not be a hex string",
  )
  .refine(
    (value) => !DECIMAL_REGEX.test(value),
    "The shortString should not be an integer string",
  )

export const BigNumberishSchema = z.union([
  z
    .string()
    .regex(
      HEX_REGEX,
      "Only hex, integers and bigint are supported in calldata",
    ),
  z
    .string()
    .regex(
      DECIMAL_REGEX,
      "Only hex, integers and bigint are supported in calldata",
    ),
  shortStringSchema,
  z.number().int("Only hex, integers and bigint are supported in calldata"),
  z.bigint(),
])

export const CallSchema = z.object({
  contractAddress: z.string(),
  entrypoint: z.string(),
  calldata: z
    .array(BigNumberishSchema.or(z.array(BigNumberishSchema)))
    .optional(),
})

export const CallsArraySchema = z.array(CallSchema).nonempty()

export const typedDataSchema = z.object({
  types: z.record(
    z.array(
      z.union([
        z.object({
          name: z.string(),
          type: z.literal("merkletree"),
          contains: z.string(),
        }),
        z.object({
          name: z.string(),
          type: z.literal("enum"),
          contains: z.string(),
        }),
        z.object({
          name: z.string(),
          type: z.string(),
        }),
      ]),
    ),
  ),
  primaryType: z.string(),
  domain: z.record(z.unknown()),
  message: z.any(),
})

export const StarknetMethodArgumentsSchemas = {
  enable: z
    .tuple([
      z
        .object({
          starknetVersion: z
            .union([z.literal("v3"), z.literal("v4")])
            .optional(),
        })
        .optional(),
    ])
    .or(z.tuple([])),
  addStarknetChain: z.tuple([
    z.object({
      id: z.string(),
      chainId: z.string(),
      chainName: z.string(),
      rpcUrls: z.array(z.string()).optional(),
      nativeCurrency: z
        .object({
          name: z.string(),
          symbol: z.string(),
          decimals: z.number(),
        })
        .optional(),
      blockExplorerUrls: z.array(z.string()).optional(),
    }),
  ]),
  switchStarknetChain: z.tuple([
    z.object({
      chainId: z.string(),
    }),
  ]),
  watchAsset: z.tuple([
    z.object({
      type: z.literal("ERC20"),
      options: z.object({
        address: z.string(),
        symbol: z.string().optional(),
        decimals: z.number().optional(),
        image: z.string().optional(),
        name: z.string().optional(),
      }),
    }),
  ]),
  requestAccounts: z.tuple([
    z.object({
      silentMode: z.boolean().optional(),
    }),
  ]),
  execute: z.tuple([
    CallsArraySchema.or(CallSchema),
    z
      .object({
        nonce: BigNumberishSchema.optional(),
        maxFee: BigNumberishSchema.optional(),
        version: BigNumberishSchema.optional(),
      })
      .optional(),
  ]),
  signMessage: z.tuple([typedDataSchema]),
} as const

export type StarknetMethods = {
  enable: (
    ...args: z.infer<typeof StarknetMethodArgumentsSchemas.enable>
  ) => Promise<string[]>
  addStarknetChain: (
    ...args: z.infer<typeof StarknetMethodArgumentsSchemas.addStarknetChain>
  ) => Promise<boolean>
  switchStarknetChain: (
    ...args: z.infer<typeof StarknetMethodArgumentsSchemas.switchStarknetChain>
  ) => Promise<boolean>
  watchAsset: (
    ...args: z.infer<typeof StarknetMethodArgumentsSchemas.watchAsset>
  ) => Promise<boolean>
  requestAccounts: (
    ...args: z.infer<typeof StarknetMethodArgumentsSchemas.requestAccounts>
  ) => Promise<string[]>
  execute: (
    ...args: z.infer<typeof StarknetMethodArgumentsSchemas.execute>
  ) => Promise<InvokeFunctionResponse>
  signMessage: (
    ...args: z.infer<typeof StarknetMethodArgumentsSchemas.signMessage>
  ) => Promise<Signature>

  getLoginStatus: () => Promise<
    | { isLoggedIn: false }
    | { isLoggedIn: true; hasSession: boolean; isPreauthorized: boolean }
  >
}

export const StarknetExecuteBackwardCompatibleArgumentsSchemas = {
  execute: z
    .tuple([
      CallsArraySchema.or(CallSchema),
      z
        .object({
          nonce: BigNumberishSchema.optional(),
          maxFee: BigNumberishSchema.optional(),
          version: BigNumberishSchema.optional(),
        })
        .optional(),
    ])
    .or(
      z.tuple([
        CallsArraySchema.or(CallSchema),
        z.array(z.any()).optional(),
        z
          .object({
            nonce: BigNumberishSchema.optional(),
            maxFee: BigNumberishSchema.optional(),
            version: BigNumberishSchema.optional(),
          })
          .optional(),
      ]),
    ),
} as const

export type StarknetExecuteBackwardCompatibleMethods = {
  execute: (
    ...args: z.infer<
      typeof StarknetExecuteBackwardCompatibleArgumentsSchemas.execute
    >
  ) => Promise<InvokeFunctionResponse>
}

export type ConnectMethods = {
  connect: () => void
}

export type ModalMethods = {
  shouldShow: () => void
  shouldHide: () => void
  heightChanged: (height: number) => void
}

export type WebWalletMethods = ConnectMethods & ModalMethods

export type IframeMethods = {
  connect: () => void
}

export const OffchainSessionDetailsSchema = z.object({
  nonce: BigNumberishSchema,
  maxFee: BigNumberishSchema.optional(),
  version: z.string(),
})

export type OffchainSessionDetails = z.infer<
  typeof OffchainSessionDetailsSchema
>

const OFFCHAIN_SESSION_ENTRYPOINT = "use_offchain_session"

export const RpcCallSchema = z
  .object({
    contract_address: z.string(),
    entrypoint: z.string(),
    calldata: z.array(BigNumberishSchema).optional(),
    offchainSessionDetails: OffchainSessionDetailsSchema.optional(),
  })
  .transform(
    ({ contract_address, entrypoint, calldata, offchainSessionDetails }) =>
      entrypoint === OFFCHAIN_SESSION_ENTRYPOINT
        ? {
            contractAddress: contract_address,
            entrypoint,
            calldata: calldata || [],
            offchainSessionDetails: offchainSessionDetails || undefined,
          }
        : {
            contractAddress: contract_address,
            entrypoint,
            calldata: calldata || [],
          },
  )

export const RpcCallsArraySchema = z.array(RpcCallSchema).nonempty()

const VERSIONS = {
  ZERO: 0,
  ONE: 1,
} as const

export const deployAccountContractSchema = z.object({
  address: z.string(),
  class_hash: z.string(),
  salt: z.string(),
  calldata: z.array(z.string()),
  sigdata: z.array(z.string()).optional(),
  //version: z.literal([0, 1]),
  version: z.nativeEnum(VERSIONS), // allow only 0 | 1, workaround since zod doesn't support literals as numbers
})

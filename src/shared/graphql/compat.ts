/**
 * Apollo Client Compatibility Shim
 *
 * Provides no-op implementations of Apollo hooks that were removed during
 * the WordPress → Supabase migration. These stubs prevent build errors
 * in components that still reference Apollo hooks but are functionally
 * dead code (will be fully rewritten to use Supabase services).
 *
 * @deprecated Remove this file once all frontend components are migrated
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * No-op gql template tag — returns the template string as-is
 */
export function gql(strings: TemplateStringsArray, ...values: any[]): string {
    return strings.reduce((result, str, i) => result + str + (values[i] || ""), "");
}

/**
 * No-op useMutation — returns a no-op function and empty state
 */
export function useMutation<TData = any, TVars = any>(
    _query: any,
    _options?: any,
): [
        (options?: { variables?: TVars }) => Promise<{ data?: TData | null }>,
        { loading: boolean; error?: Error | null; data?: TData | null },
    ] {
    const mutationFn = async (_opts?: { variables?: TVars }) => ({
        data: null as TData | null,
    });
    return [mutationFn, { loading: false, error: null, data: null }];
}

/**
 * No-op useQuery — returns empty state
 */
export function useQuery<TData = any>(
    _query: any,
    _options?: any,
): {
    data: TData | undefined;
    loading: boolean;
    error?: Error | null;
    refetch: () => Promise<any>;
} {
    return {
        data: undefined,
        loading: false,
        error: null,
        refetch: async () => ({}),
    };
}

/**
 * No-op useLazyQuery — returns a trigger function and empty state
 */
export function useLazyQuery<TData = any>(
    _query: any,
    _options?: any,
): [
        (options?: any) => void,
        { data: TData | undefined; loading: boolean; error?: Error | null },
    ] {
    const queryFn = (_opts?: any) => { };
    return [queryFn, { data: undefined, loading: false, error: null }];
}

/**
 * No-op useApolloClient
 */
export function useApolloClient(): any {
    return null;
}

/**
 * Placeholder type for ApolloError
 */
export type ApolloError = Error;

/**
 * Placeholder type for ApolloQueryResult
 */
export type ApolloQueryResult<T> = {
    data: T;
    loading: boolean;
    error?: Error;
};

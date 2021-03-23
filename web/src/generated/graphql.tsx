import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions =  {}
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Query = {
  __typename?: 'Query';
  hello: Scalars['String'];
  me?: Maybe<User>;
  findById?: Maybe<User>;
  getOutgoingFriendRequests: Array<Friend>;
  getIncomingFriendRequests: Array<Friend>;
  getFriends: Array<Friend>;
};


export type QueryFindByIdArgs = {
  id: Scalars['Int'];
};

export type User = {
  __typename?: 'User';
  id: Scalars['Float'];
  username: Scalars['String'];
  email: Scalars['String'];
  password: Scalars['String'];
  createdAt: Scalars['String'];
  updatedAt: Scalars['String'];
};

export type Friend = {
  __typename?: 'Friend';
  id: Scalars['Float'];
  requesterId: Scalars['Float'];
  requesteeId: Scalars['Float'];
  state: Scalars['Float'];
  createdAt: Scalars['String'];
  updatedAt: Scalars['String'];
  friendUser: User;
};

export type Mutation = {
  __typename?: 'Mutation';
  register: UserResponse;
  login: UserResponse;
  logout: Scalars['Boolean'];
  sendFriendRequest: FriendResponse;
  setFriendRequestState: Scalars['Boolean'];
};


export type MutationRegisterArgs = {
  options: UsernamePasswordInput;
};


export type MutationLoginArgs = {
  password: Scalars['String'];
  usernameOrEmail: Scalars['String'];
};


export type MutationSendFriendRequestArgs = {
  requesteeId: Scalars['Int'];
};


export type MutationSetFriendRequestStateArgs = {
  newState: Scalars['Int'];
  id: Scalars['Int'];
};

export type UserResponse = {
  __typename?: 'UserResponse';
  errors?: Maybe<Array<FieldError>>;
  user?: Maybe<User>;
};

export type FieldError = {
  __typename?: 'FieldError';
  field: Scalars['String'];
  message: Scalars['String'];
};

export type UsernamePasswordInput = {
  email: Scalars['String'];
  username: Scalars['String'];
  password: Scalars['String'];
};

export type FriendResponse = {
  __typename?: 'FriendResponse';
  errors?: Maybe<Array<FieldError>>;
  friend?: Maybe<Friend>;
};

export type RegularErrorFragment = (
  { __typename?: 'FieldError' }
  & Pick<FieldError, 'field' | 'message'>
);

export type RegularUserFragment = (
  { __typename?: 'User' }
  & Pick<User, 'id' | 'username'>
);

export type RegularUserResponseFragment = (
  { __typename?: 'UserResponse' }
  & { errors?: Maybe<Array<(
    { __typename?: 'FieldError' }
    & RegularErrorFragment
  )>>, user?: Maybe<(
    { __typename?: 'User' }
    & RegularUserFragment
  )> }
);

export type LoginMutationVariables = Exact<{
  usernameOrEmail: Scalars['String'];
  password: Scalars['String'];
}>;


export type LoginMutation = (
  { __typename?: 'Mutation' }
  & { login: (
    { __typename?: 'UserResponse' }
    & RegularUserResponseFragment
  ) }
);

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'logout'>
);

export type RegisterMutationVariables = Exact<{
  options: UsernamePasswordInput;
}>;


export type RegisterMutation = (
  { __typename?: 'Mutation' }
  & { register: (
    { __typename?: 'UserResponse' }
    & RegularUserResponseFragment
  ) }
);

export type SendFriendRequestMutationVariables = Exact<{
  requesteeId: Scalars['Int'];
}>;


export type SendFriendRequestMutation = (
  { __typename?: 'Mutation' }
  & { sendFriendRequest: (
    { __typename?: 'FriendResponse' }
    & { friend?: Maybe<(
      { __typename?: 'Friend' }
      & Pick<Friend, 'id' | 'requesterId' | 'requesteeId' | 'state'>
    )>, errors?: Maybe<Array<(
      { __typename?: 'FieldError' }
      & Pick<FieldError, 'field' | 'message'>
    )>> }
  ) }
);

export type SetFriendRequestStateMutationVariables = Exact<{
  id: Scalars['Int'];
  newState: Scalars['Int'];
}>;


export type SetFriendRequestStateMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'setFriendRequestState'>
);

export type GetFriendsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetFriendsQuery = (
  { __typename?: 'Query' }
  & { getFriends: Array<(
    { __typename?: 'Friend' }
    & Pick<Friend, 'id' | 'requesterId' | 'requesteeId'>
    & { friendUser: (
      { __typename?: 'User' }
      & RegularUserFragment
    ) }
  )> }
);

export type GetIncomingFriendRequestsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetIncomingFriendRequestsQuery = (
  { __typename?: 'Query' }
  & { getIncomingFriendRequests: Array<(
    { __typename?: 'Friend' }
    & Pick<Friend, 'id' | 'requesterId' | 'requesteeId' | 'state'>
    & { friendUser: (
      { __typename?: 'User' }
      & RegularUserFragment
    ) }
  )> }
);

export type GetOutgoingFriendRequestsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetOutgoingFriendRequestsQuery = (
  { __typename?: 'Query' }
  & { getOutgoingFriendRequests: Array<(
    { __typename?: 'Friend' }
    & Pick<Friend, 'id' | 'requesterId' | 'requesteeId' | 'state'>
    & { friendUser: (
      { __typename?: 'User' }
      & RegularUserFragment
    ) }
  )> }
);

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = (
  { __typename?: 'Query' }
  & { me?: Maybe<(
    { __typename?: 'User' }
    & RegularUserFragment
  )> }
);

export const RegularErrorFragmentDoc = gql`
    fragment RegularError on FieldError {
  field
  message
}
    `;
export const RegularUserFragmentDoc = gql`
    fragment RegularUser on User {
  id
  username
}
    `;
export const RegularUserResponseFragmentDoc = gql`
    fragment RegularUserResponse on UserResponse {
  errors {
    ...RegularError
  }
  user {
    ...RegularUser
  }
}
    ${RegularErrorFragmentDoc}
${RegularUserFragmentDoc}`;
export const LoginDocument = gql`
    mutation Login($usernameOrEmail: String!, $password: String!) {
  login(usernameOrEmail: $usernameOrEmail, password: $password) {
    ...RegularUserResponse
  }
}
    ${RegularUserResponseFragmentDoc}`;
export type LoginMutationFn = Apollo.MutationFunction<LoginMutation, LoginMutationVariables>;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      usernameOrEmail: // value for 'usernameOrEmail'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useLoginMutation(baseOptions?: Apollo.MutationHookOptions<LoginMutation, LoginMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, options);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = Apollo.MutationResult<LoginMutation>;
export type LoginMutationOptions = Apollo.BaseMutationOptions<LoginMutation, LoginMutationVariables>;
export const LogoutDocument = gql`
    mutation Logout {
  logout
}
    `;
export type LogoutMutationFn = Apollo.MutationFunction<LogoutMutation, LogoutMutationVariables>;

/**
 * __useLogoutMutation__
 *
 * To run a mutation, you first call `useLogoutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLogoutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [logoutMutation, { data, loading, error }] = useLogoutMutation({
 *   variables: {
 *   },
 * });
 */
export function useLogoutMutation(baseOptions?: Apollo.MutationHookOptions<LogoutMutation, LogoutMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LogoutMutation, LogoutMutationVariables>(LogoutDocument, options);
      }
export type LogoutMutationHookResult = ReturnType<typeof useLogoutMutation>;
export type LogoutMutationResult = Apollo.MutationResult<LogoutMutation>;
export type LogoutMutationOptions = Apollo.BaseMutationOptions<LogoutMutation, LogoutMutationVariables>;
export const RegisterDocument = gql`
    mutation Register($options: UsernamePasswordInput!) {
  register(options: $options) {
    ...RegularUserResponse
  }
}
    ${RegularUserResponseFragmentDoc}`;
export type RegisterMutationFn = Apollo.MutationFunction<RegisterMutation, RegisterMutationVariables>;

/**
 * __useRegisterMutation__
 *
 * To run a mutation, you first call `useRegisterMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRegisterMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [registerMutation, { data, loading, error }] = useRegisterMutation({
 *   variables: {
 *      options: // value for 'options'
 *   },
 * });
 */
export function useRegisterMutation(baseOptions?: Apollo.MutationHookOptions<RegisterMutation, RegisterMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RegisterMutation, RegisterMutationVariables>(RegisterDocument, options);
      }
export type RegisterMutationHookResult = ReturnType<typeof useRegisterMutation>;
export type RegisterMutationResult = Apollo.MutationResult<RegisterMutation>;
export type RegisterMutationOptions = Apollo.BaseMutationOptions<RegisterMutation, RegisterMutationVariables>;
export const SendFriendRequestDocument = gql`
    mutation SendFriendRequest($requesteeId: Int!) {
  sendFriendRequest(requesteeId: $requesteeId) {
    friend {
      id
      requesterId
      requesteeId
      state
    }
    errors {
      field
      message
    }
  }
}
    `;
export type SendFriendRequestMutationFn = Apollo.MutationFunction<SendFriendRequestMutation, SendFriendRequestMutationVariables>;

/**
 * __useSendFriendRequestMutation__
 *
 * To run a mutation, you first call `useSendFriendRequestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendFriendRequestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendFriendRequestMutation, { data, loading, error }] = useSendFriendRequestMutation({
 *   variables: {
 *      requesteeId: // value for 'requesteeId'
 *   },
 * });
 */
export function useSendFriendRequestMutation(baseOptions?: Apollo.MutationHookOptions<SendFriendRequestMutation, SendFriendRequestMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SendFriendRequestMutation, SendFriendRequestMutationVariables>(SendFriendRequestDocument, options);
      }
export type SendFriendRequestMutationHookResult = ReturnType<typeof useSendFriendRequestMutation>;
export type SendFriendRequestMutationResult = Apollo.MutationResult<SendFriendRequestMutation>;
export type SendFriendRequestMutationOptions = Apollo.BaseMutationOptions<SendFriendRequestMutation, SendFriendRequestMutationVariables>;
export const SetFriendRequestStateDocument = gql`
    mutation SetFriendRequestState($id: Int!, $newState: Int!) {
  setFriendRequestState(id: $id, newState: $newState)
}
    `;
export type SetFriendRequestStateMutationFn = Apollo.MutationFunction<SetFriendRequestStateMutation, SetFriendRequestStateMutationVariables>;

/**
 * __useSetFriendRequestStateMutation__
 *
 * To run a mutation, you first call `useSetFriendRequestStateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetFriendRequestStateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setFriendRequestStateMutation, { data, loading, error }] = useSetFriendRequestStateMutation({
 *   variables: {
 *      id: // value for 'id'
 *      newState: // value for 'newState'
 *   },
 * });
 */
export function useSetFriendRequestStateMutation(baseOptions?: Apollo.MutationHookOptions<SetFriendRequestStateMutation, SetFriendRequestStateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SetFriendRequestStateMutation, SetFriendRequestStateMutationVariables>(SetFriendRequestStateDocument, options);
      }
export type SetFriendRequestStateMutationHookResult = ReturnType<typeof useSetFriendRequestStateMutation>;
export type SetFriendRequestStateMutationResult = Apollo.MutationResult<SetFriendRequestStateMutation>;
export type SetFriendRequestStateMutationOptions = Apollo.BaseMutationOptions<SetFriendRequestStateMutation, SetFriendRequestStateMutationVariables>;
export const GetFriendsDocument = gql`
    query GetFriends {
  getFriends {
    id
    requesterId
    requesteeId
    friendUser {
      ...RegularUser
    }
  }
}
    ${RegularUserFragmentDoc}`;

/**
 * __useGetFriendsQuery__
 *
 * To run a query within a React component, call `useGetFriendsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFriendsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFriendsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetFriendsQuery(baseOptions?: Apollo.QueryHookOptions<GetFriendsQuery, GetFriendsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFriendsQuery, GetFriendsQueryVariables>(GetFriendsDocument, options);
      }
export function useGetFriendsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFriendsQuery, GetFriendsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFriendsQuery, GetFriendsQueryVariables>(GetFriendsDocument, options);
        }
export type GetFriendsQueryHookResult = ReturnType<typeof useGetFriendsQuery>;
export type GetFriendsLazyQueryHookResult = ReturnType<typeof useGetFriendsLazyQuery>;
export type GetFriendsQueryResult = Apollo.QueryResult<GetFriendsQuery, GetFriendsQueryVariables>;
export const GetIncomingFriendRequestsDocument = gql`
    query GetIncomingFriendRequests {
  getIncomingFriendRequests {
    id
    requesterId
    requesteeId
    state
    friendUser {
      ...RegularUser
    }
  }
}
    ${RegularUserFragmentDoc}`;

/**
 * __useGetIncomingFriendRequestsQuery__
 *
 * To run a query within a React component, call `useGetIncomingFriendRequestsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetIncomingFriendRequestsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetIncomingFriendRequestsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetIncomingFriendRequestsQuery(baseOptions?: Apollo.QueryHookOptions<GetIncomingFriendRequestsQuery, GetIncomingFriendRequestsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetIncomingFriendRequestsQuery, GetIncomingFriendRequestsQueryVariables>(GetIncomingFriendRequestsDocument, options);
      }
export function useGetIncomingFriendRequestsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetIncomingFriendRequestsQuery, GetIncomingFriendRequestsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetIncomingFriendRequestsQuery, GetIncomingFriendRequestsQueryVariables>(GetIncomingFriendRequestsDocument, options);
        }
export type GetIncomingFriendRequestsQueryHookResult = ReturnType<typeof useGetIncomingFriendRequestsQuery>;
export type GetIncomingFriendRequestsLazyQueryHookResult = ReturnType<typeof useGetIncomingFriendRequestsLazyQuery>;
export type GetIncomingFriendRequestsQueryResult = Apollo.QueryResult<GetIncomingFriendRequestsQuery, GetIncomingFriendRequestsQueryVariables>;
export const GetOutgoingFriendRequestsDocument = gql`
    query GetOutgoingFriendRequests {
  getOutgoingFriendRequests {
    id
    requesterId
    requesteeId
    state
    friendUser {
      ...RegularUser
    }
  }
}
    ${RegularUserFragmentDoc}`;

/**
 * __useGetOutgoingFriendRequestsQuery__
 *
 * To run a query within a React component, call `useGetOutgoingFriendRequestsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOutgoingFriendRequestsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOutgoingFriendRequestsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetOutgoingFriendRequestsQuery(baseOptions?: Apollo.QueryHookOptions<GetOutgoingFriendRequestsQuery, GetOutgoingFriendRequestsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetOutgoingFriendRequestsQuery, GetOutgoingFriendRequestsQueryVariables>(GetOutgoingFriendRequestsDocument, options);
      }
export function useGetOutgoingFriendRequestsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetOutgoingFriendRequestsQuery, GetOutgoingFriendRequestsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetOutgoingFriendRequestsQuery, GetOutgoingFriendRequestsQueryVariables>(GetOutgoingFriendRequestsDocument, options);
        }
export type GetOutgoingFriendRequestsQueryHookResult = ReturnType<typeof useGetOutgoingFriendRequestsQuery>;
export type GetOutgoingFriendRequestsLazyQueryHookResult = ReturnType<typeof useGetOutgoingFriendRequestsLazyQuery>;
export type GetOutgoingFriendRequestsQueryResult = Apollo.QueryResult<GetOutgoingFriendRequestsQuery, GetOutgoingFriendRequestsQueryVariables>;
export const MeDocument = gql`
    query Me {
  me {
    ...RegularUser
  }
}
    ${RegularUserFragmentDoc}`;

/**
 * __useMeQuery__
 *
 * To run a query within a React component, call `useMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useMeQuery(baseOptions?: Apollo.QueryHookOptions<MeQuery, MeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MeQuery, MeQueryVariables>(MeDocument, options);
      }
export function useMeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeQueryResult = Apollo.QueryResult<MeQuery, MeQueryVariables>;
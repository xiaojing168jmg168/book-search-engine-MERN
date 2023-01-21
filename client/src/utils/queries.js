import { gql } from '@apollo/client';

export const GET_ME = gql`
  query me{
      me{
        _id
        username
        email
        bookCount
        saveBooks{
            bookId
            authors
            image
            link
            title
            description
        }
    }
  }
`;
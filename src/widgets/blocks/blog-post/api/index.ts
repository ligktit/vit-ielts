
export const GET_POSTS = "";

export type IPost = {
    title: string;
    link: string;
    excerpt: string;
    featuredImage?: {
        node: {
            altText: string;
            sourceUrl: string;
        };
    };
};

export type IPostResponse = {
    posts: {
        edges: {
            node: IPost;
        }[];
    };
};
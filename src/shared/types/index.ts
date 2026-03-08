import { SEOType } from "../graphql"

export type IPost = {
    id: string
    databaseId: number
    link: string
    title: string
    excerpt: string
    featuredImage?: {
        node: {
            sourceUrl: string
            altText: string
        }
    }
    categories: {
        edges: Array<{
            node: {
                link: string
                name: string
                id: string
            }
            isPrimary: boolean
        }>
    }
    seo: SEOType
    date: string
    content: string
    postMeta: {
        proUserOnly: boolean
        views: number
    }
    rating: {
        rate: number
        count: number
        voted?: boolean
    }
    hasAccess: boolean
}
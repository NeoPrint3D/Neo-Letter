import { Helmet } from "react-helmet";



type SeoProps = {
    pageTitle: string;
    previewTitle: string;
    description: string;
    image: string;
    url: string;
}

export default function Seo({ pageTitle, previewTitle, description, image, url }: SeoProps) {
    return (
        <Helmet>
            <title>{pageTitle}</title>
            <meta name="description" content={description} />
            <meta property="og:title" content={previewTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:url" content={url} />
            <meta property="og:type" content="website" />
        </Helmet>
    )
}
// The API's base URL, from HANDBOOK_API_URL at build time. Until the production API has its
// domain, a placeholder: a made-up host in public docs could one day belong to someone else.
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function ApiBase() {
  const url = useDocusaurusContext().siteConfig.customFields?.apiUrl as string | undefined;
  return <code>{url || 'https://<your Neuros API address>'}</code>;
}

// The handbook's own components, available in every page without an import.
import MDXComponents from '@theme-original/MDXComponents';
import ApiBase from '@site/src/components/ApiBase';
import FieldTable from '@site/src/components/FieldTable';
import PersonaBadge from '@site/src/components/PersonaBadge';
import Shot from '@site/src/components/Shot';
import Video from '@site/src/components/Video';

export default { ...MDXComponents, Shot, FieldTable, Video, PersonaBadge, ApiBase };

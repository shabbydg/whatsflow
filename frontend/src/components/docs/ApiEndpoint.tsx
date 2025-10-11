import { CodeBlock } from './CodeBlock';

interface ApiEndpointProps {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  title: string;
  description: string;
  auth?: boolean;
  requestBody?: string;
  responseExample?: string;
  queryParams?: Array<{ name: string; type: string; description: string; required?: boolean }>;
}

export function ApiEndpoint({
  method,
  path,
  title,
  description,
  auth = true,
  requestBody,
  responseExample,
  queryParams,
}: ApiEndpointProps) {
  const methodColors = {
    GET: 'bg-blue-100 text-blue-800',
    POST: 'bg-green-100 text-green-800',
    PUT: 'bg-orange-100 text-orange-800',
    DELETE: 'bg-red-100 text-red-800',
  };

  return (
    <div className="mb-8 border-b border-gray-200 pb-8 last:border-b-0">
      <div className="flex items-start space-x-4 mb-4">
        <span className={`px-3 py-1 rounded-lg text-sm font-bold ${methodColors[method]}`}>
          {method}
        </span>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
          <code className="text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded">
            {path}
          </code>
        </div>
      </div>

      <p className="text-gray-700 mb-4">{description}</p>

      {auth && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-900">
            🔐 <strong>Authentication required:</strong> Include your API key in the Authorization header
          </p>
        </div>
      )}

      {queryParams && queryParams.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Query Parameters</h4>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            {queryParams.map((param) => (
              <div key={param.name} className="text-sm">
                <code className="text-purple-600 font-mono">{param.name}</code>
                <span className="text-gray-500 ml-2">({param.type})</span>
                {param.required && (
                  <span className="ml-2 text-xs text-red-600 font-medium">Required</span>
                )}
                <p className="text-gray-600 ml-4 mt-1">{param.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {requestBody && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Request Body</h4>
          <CodeBlock code={requestBody} language="json" />
        </div>
      )}

      {responseExample && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Response Example</h4>
          <CodeBlock code={responseExample} language="json" />
        </div>
      )}
    </div>
  );
}


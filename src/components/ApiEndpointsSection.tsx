import { methodColorMap } from '@/lib/constants';
import type { ApiDefinition, ApiEndpoint, Endpoint, HttpMethod } from '@/models/types';
import { LineChartIcon, ShieldCheck } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';

function getMethodClasses(
  method: HttpMethod,
  options?: {
    variant?: 'solid' | 'light';
    hover?: boolean;
  },
) {
  const styles = methodColorMap?.[method];
  const variant = options?.variant ?? 'solid';
  const hover = options?.hover ?? false;

  if (variant === 'solid') return styles.solid;

  return `${styles?.light} ${hover ? styles.hoverLight : ''}`;
}

export default function ApiEndpointsSection({
  api,
  setApiPanelOpen,
  setSelectedEndpoint,
}: {
  api: ApiDefinition;
  setApiPanelOpen: Dispatch<SetStateAction<boolean>>;
  setSelectedEndpoint: Dispatch<SetStateAction<Endpoint | undefined>>;
}) {
  return (
    <div className="bg-accent min-h-screen p-6 px-6 md:px-12">
      <div className="space-y-7 md:w-fit">
        {api?.resources.map((group) => {
          return (
            <div key={group.groupName} className="space-y-3">
              <a
                href={`#${group.groupName.toLowerCase()}`}
                id={group.groupName.toLowerCase()}
                className="group hover:text-primary align-center cursor gap-3 text-lg"
              >
                {group.groupName}
                <LineChartIcon
                  size={17}
                  className={`opacity-0 duration-300 group-hover:opacity-100`}
                />
              </a>

              <div className="col w-full space-y-4">
                {group.endpoints.map((endpoint: ApiEndpoint) => (
                  <button
                    className={`flex-between cursor relative w-full gap-4 overflow-hidden px-4 py-2! sm:min-w-xl ${getMethodClasses(endpoint.method, { variant: 'light', hover: true })} after:bg-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:transition-all after:duration-100 after:content-[''] hover:after:h-1 focus-visible:after:h-1`}
                    onClick={() => {
                      setApiPanelOpen(true);
                      setSelectedEndpoint({
                        name: group.groupName,
                        ...endpoint,
                      });
                    }}
                  >
                    <div className="align-center gap-4">
                      <span
                        className={`min-w-14 rounded-full py-1 text-center text-xs! shadow-sm ${getMethodClasses(endpoint.method)}`}
                      >
                        {endpoint.method}
                      </span>
                      <div className="col-start md:align-center gap-1 md:flex-row! md:gap-4">
                        <span className="text-start text-sm font-semibold">{endpoint.path}</span>
                        <span className="text-start text-sm">{endpoint.description}</span>
                      </div>
                    </div>
                    {endpoint.authenticated && (
                      <ShieldCheck size={20} className="fill-primary/70 text-black/70" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { methodColorMap } from '@/lib/constants';
import { cn, copyToClipboard } from '@/lib/utils';
import type { ApiDefinition, ApiEndpoint, Endpoint, HttpMethod } from '@/models/types';
import { Copy, Link, ShieldCheck } from 'lucide-react';
import { useState, type Dispatch, type SetStateAction } from 'react';
import ToolTip from './custom/ToolTip';

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
                <Link size={17} className={`opacity-0 duration-300 group-hover:opacity-100`} />
              </a>

              <div className="col w-full space-y-4">
                {group.endpoints.map((endpoint: ApiEndpoint) => (
                  <button
                    key={endpoint.path}
                    className={`flex-between group cursor relative w-full gap-4 overflow-hidden px-4 py-2! sm:min-w-xl ${getMethodClasses(endpoint.method, { variant: 'light', hover: true })} after:bg-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:transition-all after:duration-100 after:content-[''] hover:after:h-1 focus-visible:after:h-1`}
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

                    <EndpointActions
                      authenticated={endpoint.authenticated}
                      endpointUrl={api.baseUrl + endpoint.path}
                    />
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

export function EndpointActions({
  authenticated,
  endpointUrl,
}: {
  authenticated: boolean;
  endpointUrl: string;
}) {
  const [btnFocused, setBtnFocused] = useState<boolean>(false);

  return (
    <div className="flex-center-gp">
      {authenticated && (
        <ShieldCheck
          size={22}
          className={cn(
            'fill-primary/70 text-black/70 duration-300 ease-in-out group-hover:translate-x-0 group-focus-visible:translate-x-0 sm:translate-x-8',
            { 'translate-x-0!': btnFocused },
          )}
        />
      )}
      <ToolTip tip="Copy full URL">
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation();
              e.preventDefault();
              copyToClipboard(endpointUrl);
            }
          }}
          onFocus={() => setBtnFocused(true)}
          onBlur={() => setBtnFocused(false)}
          onClick={(e) => {
            e.stopPropagation();
            copyToClipboard(endpointUrl);
          }}
          className="bg-primary/70 hover:bg-accent hover:text-primary focus-visible:bg-accent focus-visible:text-primary flex-center size-4.75 rounded-sm! border border-black! text-white ring-1 ring-black/75! transition-all! duration-300 ease-in-out outline-none! group-hover:translate-x-0 group-hover:delay-100 group-focus-visible:translate-x-0 group-focus-visible:delay-100 hover:translate-x-0 focus:translate-x-0 focus-visible:translate-x-0 sm:translate-x-10"
        >
          <Copy className="size-2.5" />
        </div>
      </ToolTip>
    </div>
  );
}

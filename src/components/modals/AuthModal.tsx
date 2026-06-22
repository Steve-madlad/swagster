import registry from '@/api-data/registry';
import { executeHttpRequest } from '@/lib/axios';
import { isTokenExpired, manualTokenField } from '@/lib/utils';
import type { ApiDefinition, HttpMethod } from '@/models/types';
import {
  AlertTriangle,
  BadgeCheck,
  BrushCleaning,
  FingerprintPattern,
  KeySquare,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Alert } from '../custom/Alert';
import Modal from '../custom/Modal';
import ToolTip from '../custom/ToolTip';
import FormBuilder, { type FieldProps } from '../form/FormBuilder';
import { Button } from '../ui/button';
import { Kbd, KbdGroup } from '../ui/kbd';

export default function AuthModal() {
  const [open, setOpen] = useState(false);
  const onClose = () => setOpen(false);

  const params = useParams();
  const api: ApiDefinition | undefined = registry.apis.find((api) => api.id === params.name);

  const authEndpoint = api?.resources
    .find((resource) => resource.groupName === 'Authentication')
    ?.endpoints.find((endpoint) => 'isLogin' in endpoint && endpoint.isLogin === true);

  const [authError, setAuthError] = useState<string | Record<string, unknown> | undefined>();
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    setAuthToken(localStorage.getItem('auth-' + api?.name));
  }, [api?.name]);

  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === 'auth-' + api?.name) setAuthToken(e.newValue);
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [api?.name]);

  useEffect(() => {
    function handleShortcut(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 'a') setOpen(true);
    }
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const clearAuth = () => {
    localStorage.removeItem('auth-' + api?.name);
    setAuthToken(null);
  };

  const hasToken = !!authToken;
  const expired = hasToken && isTokenExpired(`auth-${api?.name}`);

  useEffect(() => {
    if (!authEndpoint && api?.authentication?.strategy !== 'manual-token') {
      setAuthError('Authentication endpoint not found in API definition');
    }

    if (!open) {
      setAuthError(undefined);
    }
  }, [authEndpoint, open]);

  async function submitAuthRequest(vals: Record<string, unknown>) {
    if (!api) return;

    if (!authEndpoint && api.authentication?.strategy !== 'manual-token') {
      toast.error('Authentication endpoint not found');
      return;
    }

    if (api.authentication?.strategy === 'manual-token') {
      const token = vals['Access Token'] as string;
      localStorage.setItem('auth-' + api?.name, token);
      setOpen(false);
      setAuthToken(token);
      return toast.success('Token applied successfully!');
    }

    const response = await executeHttpRequest({
      url: api.baseUrl + authEndpoint?.path,
      method: authEndpoint?.method as HttpMethod,
      body: vals,
    });

    if (response.data?.success) {
      setAuthError(undefined);

      const token = response.data.data?.token;
      if (token) {
        localStorage.setItem('auth-' + api?.name, token);
        setAuthToken(token);
      }

      toast.success('Authorization Successful!');
      setOpen(false);
    } else {
      setAuthError(response.error);
    }
  }

  const RenderAuthContent = () => {
    if (hasToken && api?.authentication?.strategy !== 'manual-token') {
      const alertConfig = expired
        ? {
            icon: AlertTriangle,
            title: 'Unauthorized',
            message: 'Token Expired',
            variant: 'destructive' as const,
            className: 'bg-destructive/20',
          }
        : {
            icon: BadgeCheck,
            title: 'Authorized',
            message: 'API is authorized',
            variant: 'success' as const,
            className: 'bg-[#30a36c]/40',
          };

      return (
        <div className="w-full space-y-4 p-7">
          <Alert {...alertConfig}>{alertConfig.message}</Alert>

          <Button
            onClick={clearAuth}
            size="icon-lg"
            className="hover:border-primary hover:text-primary mt-4 flex w-full gap-4 border-2 border-transparent py-5! text-sm transition-all! duration-100 hover:bg-transparent"
          >
            Clear Auth Token <BrushCleaning className="mb-1" />
          </Button>
        </div>
      );
    } else {
      return (
        <div className="w-full p-7">
          <FormBuilder
            formConfig={
              authEndpoint
                ? (api?.resources[0].endpoints?.[0].request.body as FieldProps[])
                : api?.authentication?.strategy === 'manual-token'
                  ? [manualTokenField(api.authentication.instruction, authToken || undefined)]
                  : []
            }
            onSubmit={submitAuthRequest}
            alertTitle={!authEndpoint ? 'Can Not Authorize' : undefined}
            alertText={authError}
            buttonStyles="mt-auto text-md text-base!"
            buttonText="Authorize"
            buttonIcon={<KeySquare />}
            disableGroupuing
          />
        </div>
      );
    }
  };

  return (
    <Modal
      open={open}
      title={'Authorization'}
      description={'Enter your credentials to authorize requests'}
      containerStyles={'min-h-120 w-2xl'}
      headerIcon={FingerprintPattern}
      onClose={onClose}
      triggerElement={
        <ToolTip
          tip={
            <KbdGroup>
              <Kbd>⌘</Kbd>
              <span>+</span>
              <Kbd>ALT</Kbd>
              <span>+</span>
              <Kbd>A</Kbd>
            </KbdGroup>
          }
        >
          <Button
            size={'icon-lg'}
            onClick={() => setOpen(true)}
            className="bg-primary align-center fixed right-4 bottom-4 z-1 w-fit gap-3 rounded-full! px-6! py-5! text-sm text-white hover:scale-110 focus-visible:bg-primary/80! hover:scale-3d focus-visible:scale-110 focus-visible:scale-3d md:right-7 lg:bottom-7"
          >
            Authorize <KeySquare size={50} />
          </Button>
        </ToolTip>
      }
    >
      <RenderAuthContent />
    </Modal>
  );
}

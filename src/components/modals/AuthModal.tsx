import registry from '@/api-data/registry';
import { executeHttpRequest } from '@/lib/axios';
import { isTokenExpired } from '@/lib/utils';
import type { HttpMethod } from '@/models/types';
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
import FormBuilder, { type FieldProps } from '../form/FormBuilder';
import { Button } from '../ui/button';

export default function AuthModal() {
  const [open, setOpen] = useState(false);
  const onClose = () => setOpen(false);

  const params = useParams();
  const api = registry.apis.find((api) => api.id === params.name);

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

  const clearAuth = () => {
    localStorage.removeItem('auth-' + api?.name);
    setAuthToken(null);
  };

  const hasToken = !!authToken;
  const expired = hasToken && isTokenExpired(`auth-${api?.name}`);

  async function submitAuthRequest(vals: Record<string, unknown>) {
    if (!api) return;

    const authEndpoint = api?.resources
      .find((resource) => resource.groupName === 'Authentication')
      ?.endpoints.find((endpoint) => 'isLogin' in endpoint && endpoint.isLogin === true);

    if (!authEndpoint) {
      toast.error('Authentication endpoint not found');
      return;
    }

    const response = await executeHttpRequest({
      url: api.baseUrl + authEndpoint.path,
      method: authEndpoint?.method as HttpMethod,
      body: vals,
      auth: {
        headerName: api?.authentication.headerName || '',
        token: localStorage.getItem('auth-' + api?.name) || '',
      },
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
    if (hasToken) {
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
            formConfig={api?.resources[0].endpoints?.[0].request.body as FieldProps[]}
            onSubmit={submitAuthRequest}
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
        <Button
          size={'icon-lg'}
          onClick={() => setOpen(true)}
          className="bg-primary align-center fixed right-7 bottom-4 z-1 w-fit gap-3 rounded-full! px-6! py-5! text-sm text-white hover:scale-110 hover:scale-3d lg:bottom-7"
        >
          Authorize <KeySquare size={50} />
        </Button>
      }
    >
      <RenderAuthContent />
    </Modal>
  );
}

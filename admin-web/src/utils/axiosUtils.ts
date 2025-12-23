import axios from 'axios';

export function getAxiosErrorText(error: unknown): string | undefined {
  return axios.isAxiosError<{ error?: string }>(error)
    ? error.response?.data?.error
    : undefined;
}



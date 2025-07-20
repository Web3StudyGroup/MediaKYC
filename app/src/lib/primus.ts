import { PrimusZKTLS } from '@primuslabs/zktls-js-sdk';

let primusZKTLS: PrimusZKTLS | null = null;

export const initializePrimus = async (appId: string) => {
  if (!primusZKTLS) {
    primusZKTLS = new PrimusZKTLS();
    const result = await primusZKTLS.init(appId);
    console.log('Primus initialized:', result);
    return result;
  }
  return primusZKTLS;
};

export const generateXAccountProof = async (
  templateId: string,
  userAddress: string,
  customParams?: Record<string, any>
) => {
  if (!primusZKTLS) {
    throw new Error('Primus not initialized');
  }

  try {
    // Generate proof request
    const request = primusZKTLS.generateRequestParams(templateId, userAddress);

    // Set additional parameters if provided
    if (customParams) {
      const additionParams = JSON.stringify(customParams);
      request.setAdditionParams(additionParams);
    }

    // Set zkTLS mode to proxy mode for better performance
    request.setAttMode({
      algorithmType: 'proxytls',
    });

    // Convert request to string
    const requestStr = request.toJsonString();

    // Get signed request from backend
    const response = await fetch('/api/primus/sign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ signParams: requestStr }),
    });

    if (!response.ok) {
      throw new Error('Failed to get signed request from backend');
    }

    const { signResult } = await response.json();

    // Start attestation process - this will redirect to X for verification
    console.log('Starting attestation process...');
    const attestation = await primusZKTLS.startAttestation(signResult);
    console.log('Attestation generated:', attestation);

    // Verify the attestation
    const verifyResult = await primusZKTLS.verifyAttestation(attestation);
    console.log('Verification result:', verifyResult);

    if (verifyResult) {
      console.log('X account verification successful!');
      console.log('=== PRIMUS LIB DEBUG ===');
      console.log('Returning attestation:', attestation);
      console.log('Attestation structure:', JSON.stringify(attestation, null, 2));
      return attestation;
    } else {
      console.error('Attestation verification failed');
      throw new Error('Attestation verification failed');
    }
  } catch (error) {
    console.error('Error generating X account proof:', error);
    throw error;
  }
};

export const generateBilibiliProof = async (
  templateId: string,
  userAddress: string,
  customParams?: Record<string, any>
) => {
  if (!primusZKTLS) {
    throw new Error('Primus not initialized');
  }

  try {
    // Generate proof request
    const request = primusZKTLS.generateRequestParams(templateId, userAddress);

    // Set additional parameters if provided
    if (customParams) {
      const additionParams = JSON.stringify(customParams);
      request.setAdditionParams(additionParams);
    }

    // Set zkTLS mode to proxy mode for better performance
    request.setAttMode({
      algorithmType: 'proxytls',
    });

    // Convert request to string
    const requestStr = request.toJsonString();

    // Get signed request from backend
    const response = await fetch('/api/primus/sign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ signParams: requestStr }),
    });

    if (!response.ok) {
      throw new Error('Failed to get signed request from backend');
    }

    const { signResult } = await response.json();

    // Start attestation process - this will redirect to Bilibili for verification
    console.log('Starting Bilibili attestation process...');
    const attestation = await primusZKTLS.startAttestation(signResult);
    console.log('Bilibili attestation generated:', attestation);

    // Verify the attestation
    const verifyResult = await primusZKTLS.verifyAttestation(attestation);
    console.log('Bilibili verification result:', verifyResult);

    if (verifyResult) {
      console.log('Bilibili account verification successful!');
      console.log('=== BILIBILI PRIMUS LIB DEBUG ===');
      console.log('Returning attestation:', attestation);
      console.log('Attestation structure:', JSON.stringify(attestation, null, 2));
      return attestation;
    } else {
      console.error('Bilibili attestation verification failed');
      throw new Error('Bilibili attestation verification failed');
    }
  } catch (error) {
    console.error('Error generating Bilibili account proof:', error);
    throw error;
  }
};

export const generateTikTokProof = async (
  templateId: string,
  userAddress: string,
  customParams?: Record<string, any>
) => {
  if (!primusZKTLS) {
    throw new Error('Primus not initialized');
  }

  try {
    // Generate proof request
    const request = primusZKTLS.generateRequestParams(templateId, userAddress);

    // Set additional parameters if provided
    if (customParams) {
      const additionParams = JSON.stringify(customParams);
      request.setAdditionParams(additionParams);
    }

    // Set zkTLS mode to proxy mode for better performance
    request.setAttMode({
      algorithmType: 'proxytls',
    });

    // Convert request to string
    const requestStr = request.toJsonString();

    // Get signed request from backend
    const response = await fetch('/api/primus/sign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ signParams: requestStr }),
    });

    if (!response.ok) {
      throw new Error('Failed to get signed request from backend');
    }

    const { signResult } = await response.json();

    // Start attestation process - this will redirect to TikTok for verification
    console.log('Starting TikTok attestation process...');
    const attestation = await primusZKTLS.startAttestation(signResult);
    console.log('TikTok attestation generated:', attestation);

    // Verify the attestation
    const verifyResult = await primusZKTLS.verifyAttestation(attestation);
    console.log('TikTok verification result:', verifyResult);

    if (verifyResult) {
      console.log('TikTok account verification successful!');
      console.log('=== TIKTOK PRIMUS LIB DEBUG ===');
      console.log('Returning attestation:', attestation);
      console.log('Attestation structure:', JSON.stringify(attestation, null, 2));
      return attestation;
    } else {
      console.error('TikTok attestation verification failed');
      throw new Error('TikTok attestation verification failed');
    }
  } catch (error) {
    console.error('Error generating TikTok account proof:', error);
    throw error;
  }
};

export const generateBinanceProof = async (
  templateId: string,
  userAddress: string,
  customParams?: Record<string, any>
) => {
  if (!primusZKTLS) {
    throw new Error('Primus not initialized');
  }

  try {
    // Generate proof request
    const request = primusZKTLS.generateRequestParams(templateId, userAddress);

    // Set additional parameters if provided
    if (customParams) {
      const additionParams = JSON.stringify(customParams);
      request.setAdditionParams(additionParams);
    }

    // Set zkTLS mode to proxy mode for better performance
    request.setAttMode({
      algorithmType: 'proxytls',
    });

    // Convert request to string
    const requestStr = request.toJsonString();

    // Get signed request from backend
    const response = await fetch('/api/primus/sign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ signParams: requestStr }),
    });

    if (!response.ok) {
      throw new Error('Failed to get signed request from backend');
    }

    const { signResult } = await response.json();

    // Start attestation process - this will redirect to Binance for verification
    console.log('Starting Binance attestation process...');
    const attestation = await primusZKTLS.startAttestation(signResult);
    console.log('Binance attestation generated:', attestation);

    // Verify the attestation
    const verifyResult = await primusZKTLS.verifyAttestation(attestation);
    console.log('Binance verification result:', verifyResult);

    if (verifyResult) {
      console.log('Binance account verification successful!');
      console.log('=== BINANCE PRIMUS LIB DEBUG ===');
      console.log('Returning attestation:', attestation);
      console.log('Attestation structure:', JSON.stringify(attestation, null, 2));
      return attestation;
    } else {
      console.error('Binance attestation verification failed');
      throw new Error('Binance attestation verification failed');
    }
  } catch (error) {
    console.error('Error generating Binance account proof:', error);
    throw error;
  }
};

export const getPrimusInstance = () => {
  return primusZKTLS;
};
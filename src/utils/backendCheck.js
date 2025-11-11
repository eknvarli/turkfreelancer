// Backend bağlantı kontrolü
export const checkBackendConnection = async () => {
  try {
    const response = await fetch('http://localhost:4000/auth/extension-check', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Backend connection OK:', data);
      return { success: true, data };
    } else {
      console.error('Backend connection failed:', response.status);
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.error('Backend connection error:', error);
    return { success: false, error: error.message };
  }
};

// Backend durumunu kontrol et ve kullanıcıyı bilgilendir
export const checkAndNotifyBackendStatus = async () => {
  const result = await checkBackendConnection();
  
  if (!result.success) {
    alert(
      `Backend sunucusuna ulaşılamıyor!\n\n` +
      `Lütfen aşağıdakileri kontrol edin:\n` +
      `• Backend sunucusu çalışıyor mu? (localhost:4000)\n` +
      `• Port 4000 kullanımda mı?\n` +
      `• Firewall/Proxy ayarları\n\n` +
      `Hata: ${result.error}`
    );
    return false;
  }
  
  return true;
};
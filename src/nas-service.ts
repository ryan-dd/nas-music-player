/**
 * NAS Service for connecting to Synology NAS
 * Supports File Station API and WebDAV protocols
 */

export interface NASCredentials {
  address: string;
  username: string;
  password: string;
  musicPath: string;
}

export interface MusicFile {
  name: string;
  path: string;
  size: number;
  isDirectory: boolean;
  extension?: string;
}

export class NASService {
  private credentials: NASCredentials | null = null;
  private sessionId: string | null = null;

  /**
   * Connect to Synology NAS using File Station API
   */
  async connect(credentials: NASCredentials): Promise<boolean> {
    this.credentials = credentials;
    
    try {
      // Synology File Station API login
      const params = new URLSearchParams({
        api: 'SYNO.API.Auth',
        version: '3',
        method: 'login',
        account: credentials.username,
        passwd: credentials.password,
        session: 'FileStation',
        format: 'sid'
      });
      
      const loginUrl = `http://${credentials.address}/webapi/auth.cgi?${params.toString()}`;
      
      console.log('正在连接到 NAS:', loginUrl.replace(credentials.password, '***'));
      
      const response = await fetch(loginUrl, {
        method: 'GET',
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status}`);
      }

      const data = await response.json();
      console.log('NAS响应:', data);

      if (data.success) {
        this.sessionId = data.data.sid;
        console.log('连接成功！Session ID已获取');
        return true;
      } else {
        const errorCode = data.error?.code || '未知错误';
        throw new Error(`登录失败，错误代码: ${errorCode}`);
      }
    } catch (error) {
      console.error('NAS连接错误:', error);
      throw error;
    }
  }

  /**
   * List music files from the specified directory
   */
  async listMusicFiles(folderPath?: string): Promise<MusicFile[]> {
    if (!this.sessionId || !this.credentials) {
      throw new Error('未连接到NAS');
    }

    const path = folderPath || this.credentials.musicPath || '/music';

    try {
      const params = new URLSearchParams({
        api: 'SYNO.FileStation.List',
        version: '2',
        method: 'list',
        folder_path: path,
        additional: 'size,time,type',
        _sid: this.sessionId
      });
      
      const listUrl = `http://${this.credentials.address}/webapi/entry.cgi?${params.toString()}`;
      
      console.log('正在获取音乐文件列表...');
      
      const response = await fetch(listUrl, {
        method: 'GET',
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status}`);
      }

      const data = await response.json();
      console.log('文件列表响应:', data);

      if (data.success) {
        const files: MusicFile[] = data.data.files
          .filter((file: any) => {
            // Filter for audio files
            const audioExtensions = ['.mp3', '.flac', '.wav', '.m4a', '.aac', '.ogg', '.wma'];
            const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
            return audioExtensions.includes(ext) || file.isdir;
          })
          .map((file: any) => ({
            name: file.name,
            path: file.path,
            size: file.additional?.size || 0,
            isDirectory: file.isdir,
            extension: file.name.substring(file.name.lastIndexOf('.'))
          }));

        console.log(`找到 ${files.length} 个音频文件`);
        return files;
      } else {
        throw new Error('获取文件列表失败');
      }
    } catch (error) {
      console.error('获取文件列表错误:', error);
      throw error;
    }
  }

  /**
   * Get streaming URL for a music file
   */
  getMusicStreamUrl(filePath: string): string {
    if (!this.credentials || !this.sessionId) {
      throw new Error('Not connected to NAS');
    }

    // Use File Station download API
    return `http://${this.credentials.address}/webapi/entry.cgi?api=SYNO.FileStation.Download&version=2&method=download&path=${encodeURIComponent(filePath)}&mode=open&_sid=${this.sessionId}`;
  }

  /**
   * Disconnect from NAS
   */
  async disconnect(): Promise<void> {
    if (!this.sessionId || !this.credentials) {
      return;
    }

    try {
      const params = new URLSearchParams({
        api: 'SYNO.API.Auth',
        version: '3',
        method: 'logout',
        session: 'FileStation',
        _sid: this.sessionId
      });
      
      const logoutUrl = `http://${this.credentials.address}/webapi/auth.cgi?${params.toString()}`;
      
      await fetch(logoutUrl, {
        method: 'GET',
        mode: 'cors',
      });
      
      console.log('已断开NAS连接');
    } catch (error) {
      console.error('登出错误:', error);
    } finally {
      this.sessionId = null;
      this.credentials = null;
    }
  }

  /**
   * Test connection to NAS (without authentication)
   */
  async testConnection(address: string): Promise<boolean> {
    try {
      const params = new URLSearchParams({
        api: 'SYNO.API.Info',
        version: '1',
        method: 'query',
        query: 'SYNO.API.Auth,SYNO.FileStation.List'
      });
      
      const testUrl = `http://${address}/webapi/query.cgi?${params.toString()}`;
      
      const response = await fetch(testUrl, {
        method: 'GET',
        mode: 'cors',
      });

      return response.ok;
    } catch (error) {
      console.error('连接测试失败:', error);
      return false;
    }
  }
}

export default NASService;

import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;

  connect(token?: string): void {
    if (this.socket?.connected) {
      return;
    }

    const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
    
    this.socket = io(serverUrl, {
      auth: {
        token: token || localStorage.getItem('authToken')
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      console.log('✅ Connecté au serveur WebSocket');
      this.isConnected = true;
      
      // Join user room for personalized notifications
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.id) {
        this.socket?.emit('join-room', `user-${user.id}`);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Déconnecté du serveur WebSocket:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Erreur de connexion WebSocket:', error);
      this.isConnected = false;
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Reconnecté au serveur WebSocket (tentative ${attemptNumber})`);
      this.isConnected = true;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('❌ Erreur de reconnexion WebSocket:', error);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Event listeners
  onNewMessage(callback: (data: any) => void): void {
    this.socket?.on('new-message', callback);
  }

  onLeadCaptured(callback: (data: any) => void): void {
    this.socket?.on('lead-captured', callback);
  }

  onConversationUpdate(callback: (data: any) => void): void {
    this.socket?.on('conversation-update', callback);
  }

  onSystemNotification(callback: (data: any) => void): void {
    this.socket?.on('system-notification', callback);
  }

  onUserStatusChange(callback: (data: any) => void): void {
    this.socket?.on('user-status-change', callback);
  }

  // Event emitters
  joinRoom(roomId: string): void {
    this.socket?.emit('join-room', roomId);
  }

  leaveRoom(roomId: string): void {
    this.socket?.emit('leave-room', roomId);
  }

  sendTyping(conversationId: string): void {
    this.socket?.emit('typing', { conversationId });
  }

  stopTyping(conversationId: string): void {
    this.socket?.emit('stop-typing', { conversationId });
  }

  updateUserStatus(status: 'online' | 'away' | 'busy' | 'offline'): void {
    this.socket?.emit('user-status', { status });
  }

  // Remove event listeners
  offNewMessage(): void {
    this.socket?.off('new-message');
  }

  offLeadCaptured(): void {
    this.socket?.off('lead-captured');
  }

  offConversationUpdate(): void {
    this.socket?.off('conversation-update');
  }

  offSystemNotification(): void {
    this.socket?.off('system-notification');
  }

  offUserStatusChange(): void {
    this.socket?.off('user-status-change');
  }

  // Utility methods
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  // Reconnect manually
  reconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
    setTimeout(() => {
      this.connect();
    }, 1000);
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;

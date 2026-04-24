import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { firstValueFrom } from 'rxjs';
import { ClientService, Client } from './client.service';

describe('ClientService', () => {
  let service: ClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getClients', () => {
    it('should return all clients', async () => {
      const clients = await firstValueFrom(service.getClients());
      expect(clients.length).toBeGreaterThan(0);
      expect(clients[0]).toHaveProperty('id');
      expect(clients[0]).toHaveProperty('name');
    });
  });

  describe('addClient', () => {
    it('should add a new client and return it with an id', async () => {
      const newClient: Partial<Client> = {
        name: 'Test Client',
        email: 'test@example.com',
        company: 'Test Corp',
        status: 'active',
        outstanding: 0,
        initials: 'TC',
        color: '#0F4C81'
      };

      const client = await firstValueFrom(service.addClient(newClient as Client));
      expect(client.id).toBeDefined();
      expect(client.name).toBe('Test Client');
    });
  });

  describe('updateClient', () => {
    it('should update an existing client', async () => {
      const clients = await firstValueFrom(service.getClients());
      const client = clients[0];
      if (!client) return;

      const updatedName = 'Updated Name';
      const updated = await firstValueFrom(service.updateClient(client.id, { name: updatedName }));
      expect(updated.name).toBe(updatedName);
    });
  });

  describe('deleteClient', () => {
    it('should delete an existing client', async () => {
      const clients = await firstValueFrom(service.getClients());
      const initialCount = clients.length;
      const clientToDelete = clients[0];
      if (!clientToDelete) return;

      await firstValueFrom(service.deleteClient(clientToDelete.id));
      const newClients = await firstValueFrom(service.getClients());
      expect(newClients.length).toBe(initialCount - 1);
      expect(newClients.find(c => c.id === clientToDelete.id)).toBeUndefined();
    });
  });
});
import { Injectable } from '@angular/core';
import { Client } from '../models/pages/client.model';

@Injectable({ providedIn: 'root' })
export class ClientStoreService {
  clients: Client[] = [
    {
      id: 1,
      name: 'Ana Souza',
      email: 'ana.souza@example.com',
      phone: '(11) 98452-1102',
      location: 'São Paulo - SP',
      orders: 4,
      initials: 'AS',
      lastOrder: '10/11/2026',
      measurementStatus: 'Atualizadas',
      newThisMonth: false,
      measurements: { bust: 92, waist: 72, hip: 98, length: 136 },
      orderHistory: [
        { id: 'PED-108', piece: 'Vestido Longo Sereia Gala', fabricColor: 'Wax Dourado / Preto', value: 480, orderDate: '10/11/2026', status: 'Entregue' },
        { id: 'PED-094', piece: 'Conjunto Saia Midi + Cropped', fabricColor: 'Linho Rústico Terracota', value: 360, orderDate: '12/08/2026', status: 'Entregue' },
        { id: 'PED-071', piece: 'Macacão Pantalona Decote Canoa', fabricColor: 'Crepe Wax Estampa Solar', value: 310, orderDate: '28/05/2026', status: 'Entregue' },
        { id: 'PED-045', piece: 'Ajuste Fino e Barra de Vestido', fabricColor: 'Peça externa', value: 140, orderDate: '18/03/2026', status: 'Entregue' }
      ]
    },
    { id: 2, name: 'Camila Oliveira', email: 'camila.oliveira@example.com', phone: '(21) 99876-5432', location: 'Rio de Janeiro - RJ', orders: 5, initials: 'CO', lastOrder: '14/11/2026', measurementStatus: 'Atualizadas', newThisMonth: true, measurements: { bust: 88, waist: 68, hip: 96, length: 132 } },
    { id: 3, name: 'Jéssica Lima', email: 'jessica.lima@example.com', phone: '(11) 97123-4567', location: 'São Paulo - SP', orders: 2, initials: 'JL', lastOrder: '12/11/2026', measurementStatus: 'Pendente Medição', newThisMonth: true, measurements: { bust: 0, waist: 0, hip: 0, length: 0 } },
    { id: 4, name: 'Juliana Alves', email: 'juliana.alves@example.com', phone: '(11) 99432-8711', location: 'São Paulo - SP', orders: 1, initials: 'JA', lastOrder: '15/11/2026', measurementStatus: 'Pendente Medição', newThisMonth: false, measurements: { bust: 0, waist: 0, hip: 0, length: 0 } },
    { id: 5, name: 'Beatriz Santos', email: 'beatriz.santos@example.com', phone: '(31) 98711-2233', location: 'Belo Horizonte - MG', orders: 6, initials: 'BS', lastOrder: '16/11/2026', measurementStatus: 'Atualizadas', newThisMonth: true, measurements: { bust: 94, waist: 76, hip: 106, length: 142 } },
    { id: 6, name: 'Larissa Costa', email: 'larissa.costa@example.com', phone: '(11) 98231-4401', location: 'Campinas - SP', orders: 3, initials: 'LC', lastOrder: '17/11/2026', measurementStatus: 'Atualizadas', newThisMonth: true, measurements: { bust: 90, waist: 70, hip: 100, length: 138 } },
    { id: 7, name: 'Fernanda Rocha', email: 'fernanda.rocha@example.com', phone: '(21) 99761-3280', location: 'Niterói - RJ', orders: 2, initials: 'FR', lastOrder: '13/11/2026', measurementStatus: 'Pendente Medição', newThisMonth: false, measurements: { bust: 0, waist: 0, hip: 0, length: 0 } },
    { id: 8, name: 'Patrícia Mendes', email: 'patricia.mendes@example.com', phone: '(31) 99145-6723', location: 'Contagem - MG', orders: 4, initials: 'PM', lastOrder: '11/11/2026', measurementStatus: 'Atualizadas', newThisMonth: true, measurements: { bust: 96, waist: 78, hip: 108, length: 140 } },
    { id: 9, name: 'Rafaela Martins', email: 'rafaela.martins@example.com', phone: '(41) 98452-1906', location: 'Curitiba - PR', orders: 1, initials: 'RM', lastOrder: '09/11/2026', measurementStatus: 'Pendente Medição', newThisMonth: true, measurements: { bust: 0, waist: 0, hip: 0, length: 0 } },
    { id: 10, name: 'Bruna Ferreira', email: 'bruna.ferreira@example.com', phone: '(51) 99632-7854', location: 'Porto Alegre - RS', orders: 3, initials: 'BF', lastOrder: '08/11/2026', measurementStatus: 'Atualizadas', newThisMonth: false, measurements: { bust: 86, waist: 66, hip: 94, length: 130 } },
    { id: 11, name: 'Isabela Ribeiro', email: 'isabela.ribeiro@example.com', phone: '(71) 98823-6410', location: 'Salvador - BA', orders: 2, initials: 'IR', lastOrder: '07/11/2026', measurementStatus: 'Pendente Medição', newThisMonth: true, measurements: { bust: 0, waist: 0, hip: 0, length: 0 } },
    { id: 12, name: 'Carolina Nunes', email: 'carolina.nunes@example.com', phone: '(81) 99214-5738', location: 'Recife - PE', orders: 5, initials: 'CN', lastOrder: '05/11/2026', measurementStatus: 'Atualizadas', newThisMonth: false, measurements: { bust: 98, waist: 80, hip: 110, length: 145 } },
    { id: 13, name: 'Aline Barros', email: 'aline.barros@example.com', phone: '(61) 98157-0246', location: 'Brasília - DF', orders: 1, initials: 'AB', lastOrder: '03/11/2026', measurementStatus: 'Pendente Medição', newThisMonth: true, measurements: { bust: 0, waist: 0, hip: 0, length: 0 } },
    { id: 14, name: 'Vitória Cardoso', email: 'vitoria.cardoso@example.com', phone: '(85) 98740-3165', location: 'Fortaleza - CE', orders: 4, initials: 'VC', lastOrder: '02/11/2026', measurementStatus: 'Atualizadas', newThisMonth: false, measurements: { bust: 92, waist: 74, hip: 102, length: 137 } },
    { id: 15, name: 'Débora Araújo', email: 'debora.araujo@example.com', phone: '(62) 99531-8427', location: 'Goiânia - GO', orders: 2, initials: 'DA', lastOrder: '01/11/2026', measurementStatus: 'Pendente Medição', newThisMonth: true, measurements: { bust: 0, waist: 0, hip: 0, length: 0 } }
  ];

  setClients(clients: Client[]): void {
    this.clients = clients;
  }
}

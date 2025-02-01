'use strict';

const request = require('supertest');
const express = require('express');
const memberGroupController = require('../controllers/memberGroupController');
const memberGroupService = require('../services/memberGroupService');

// Crear una app Express simulada para las pruebas
const app = express();
app.use(express.json());

// Definir la ruta bajo prueba
app.delete('/member-group', memberGroupController.removeMemberFromGroup);

jest.mock('../services/memberGroupService');

describe('MemberGroupController - removeMemberFromGroup', () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {}); // 🔹 Oculta console.error
  });

  afterAll(() => {
    console.error.mockRestore(); // 🔹 Restaura console.error después de los tests
  });

  it('debería eliminar correctamente una relación miembro-grupo', async () => {
    // Mock del servicio
    memberGroupService.removeMemberFromGroup.mockResolvedValue({
      success: true,
      message: 'Relación eliminada correctamente.',
    });

    const response = await request(app)
      .delete('/member-group')
      .send({
        memberId: '12345',
        groupId: '67890',
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: 'Relación eliminada correctamente.',
    });

    expect(memberGroupService.removeMemberFromGroup).toHaveBeenCalledWith(
      '12345',
      '67890'
    );
  });

  it('debería devolver un error 400 si faltan parámetros obligatorios', async () => {
    const response = await request(app)
      .delete('/member-group')
      .send({
        memberId: '12345',
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Faltan parámetros obligatorios: memberId y groupId.',
    });
  });

  it('debería manejar errores internos del servidor', async () => {
    // Mock de error en el servicio
    memberGroupService.removeMemberFromGroup.mockRejectedValue(
      new Error('Error al eliminar la relación.')
    );

    const response = await request(app)
      .delete('/member-group')
      .send({
        memberId: '12345',
        groupId: '67890',
      });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: 'Error al eliminar la relación miembro-grupo. Por favor, inténtalo más tarde.',
    });

    expect(memberGroupService.removeMemberFromGroup).toHaveBeenCalledWith(
      '12345',
      '67890'
    );
  });
});

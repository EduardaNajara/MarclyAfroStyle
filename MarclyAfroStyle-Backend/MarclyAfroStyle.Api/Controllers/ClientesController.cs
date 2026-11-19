using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MarclyAfroStyle.Api.Data;
using MarclyAfroStyle.Api.Models;

namespace MarclyAfroStyle.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClientesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ClientesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/clientes
        [HttpGet]
        public async Task<IActionResult> GetClientes()
        {
            var clientes = await _context.Clientes
                .Where(c => c.Ativo)
                .OrderByDescending(c => c.IdCliente)
                .ToListAsync();

            return Ok(clientes);
        }

        // POST: api/clientes
        [HttpPost]
        public async Task<IActionResult> CreateCliente([FromBody] Cliente novoCliente)
        {
            if (string.IsNullOrWhiteSpace(novoCliente.NomeCompleto) || string.IsNullOrWhiteSpace(novoCliente.Telefone))
            {
                return BadRequest(new { message = "Nome completo e telefone são obrigatórios." });
            }

            novoCliente.IdCliente = 0;
            novoCliente.Ativo = true;

            _context.Clientes.Add(novoCliente);
            await _context.SaveChangesAsync();

            return Ok(novoCliente);
        }

        // PUT: api/clientes/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCliente(int id, [FromBody] Cliente clienteAtualizado)
        {
            var clienteExistente = await _context.Clientes.FindAsync(id);

            if (clienteExistente == null)
            {
                return NotFound(new { message = "Cliente não encontrada." });
            }

            clienteExistente.NomeCompleto = clienteAtualizado.NomeCompleto;
            clienteExistente.Email = clienteAtualizado.Email;
            clienteExistente.Telefone = clienteAtualizado.Telefone;
            clienteExistente.Localizacao = clienteAtualizado.Localizacao;
            clienteExistente.DataNascimento = clienteAtualizado.DataNascimento;
            clienteExistente.TecidoPreferencia = clienteAtualizado.TecidoPreferencia;
            clienteExistente.MedidaBusto = clienteAtualizado.MedidaBusto;
            clienteExistente.MedidaCintura = clienteAtualizado.MedidaCintura;
            clienteExistente.MedidaQuadril = clienteAtualizado.MedidaQuadril;
            clienteExistente.MedidaComprimento = clienteAtualizado.MedidaComprimento;
            clienteExistente.Observacoes = clienteAtualizado.Observacoes;

            await _context.SaveChangesAsync();

            return Ok(clienteExistente);
        }

        // DELETE: api/clientes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCliente(int id)
        {
            var cliente = await _context.Clientes.FindAsync(id);
            if (cliente == null)
            {
                return NotFound();
            }

            cliente.Ativo = false;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MarclyAfroStyle.Api.Data;
using MarclyAfroStyle.Api.Models;

namespace MarclyAfroStyle.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PedidosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PedidosController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/pedidos
        [HttpGet]
        public async Task<IActionResult> GetPedidos()
        {
            var pedidos = await _context.Pedidos
                .Include(p => p.IdClienteNavigation)
                .Include(p => p.PedidoAnotacos.OrderByDescending(a => a.DataRegisto))
                .OrderByDescending(p => p.IdPedido)
                .ToListAsync();

            return Ok(pedidos);
        }

        // GET: api/pedidos/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPedido(int id)
        {
            var pedido = await _context.Pedidos
                .Include(p => p.IdClienteNavigation)
                .Include(p => p.PedidoAnotacos.OrderByDescending(a => a.DataRegisto))
                .FirstOrDefaultAsync(p => p.IdPedido == id);

            if (pedido == null)
            {
                return NotFound(new { message = "Pedido não encontrado." });
            }

            return Ok(pedido);
        }

        // POST: api/pedidos
        [HttpPost]
        public async Task<IActionResult> CreatePedido([FromBody] CreatePedidoDto dto)
        {
            if (dto.IdCliente <= 0 || string.IsNullOrWhiteSpace(dto.TipoPeca))
            {
                return BadRequest(new { message = "Cliente e tipo de peça são obrigatórios." });
            }

            var clienteExiste = await _context.Clientes.AnyAsync(c => c.IdCliente == dto.IdCliente);
            if (!clienteExiste)
            {
                return BadRequest(new { message = "A cliente selecionada não foi encontrada." });
            }

            var dataPrevista = ParseDateOnly(dto.DataPrevistaEntrega) ?? DateOnly.FromDateTime(DateTime.Today.AddDays(7));
            var statusInicial = string.IsNullOrWhiteSpace(dto.StatusAtual) ? "Não iniciado" : dto.StatusAtual.Trim();

            var novoPedido = new Pedido
            {
                IdCliente = dto.IdCliente,
                TipoPeca = dto.TipoPeca.Trim(),
                ValorTotal = dto.ValorTotal,
                CondicaoPagamento = string.IsNullOrWhiteSpace(dto.CondicaoPagamento) ? "A combinar" : dto.CondicaoPagamento.Trim(),
                DataPedido = ParseDateOnly(dto.DataPedido) ?? DateOnly.FromDateTime(DateTime.Today),
                DataSugeridaProva = ParseDateOnly(dto.DataSugeridaProva),
                DataPrevistaEntrega = dataPrevista,
                Prioridade = dto.Prioridade,
                StatusAtual = statusInicial,
                DetalhesObservacoes = string.IsNullOrWhiteSpace(dto.DetalhesObservacoes) ? null : dto.DetalhesObservacoes.Trim()
            };

            AplicarTimestampPorStatus(novoPedido, statusInicial);

            _context.Pedidos.Add(novoPedido);
            await _context.SaveChangesAsync();

            await _context.Entry(novoPedido).Reference(p => p.IdClienteNavigation).LoadAsync();

            return Ok(novoPedido);
        }

        // PUT: api/pedidos/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePedido(int id, [FromBody] CreatePedidoDto dto)
        {
            var pedido = await _context.Pedidos
                .Include(p => p.IdClienteNavigation)
                .FirstOrDefaultAsync(p => p.IdPedido == id);

            if (pedido == null)
            {
                return NotFound(new { message = "Pedido não encontrado." });
            }

            if (dto.IdCliente > 0)
            {
                pedido.IdCliente = dto.IdCliente;
            }

            pedido.TipoPeca = dto.TipoPeca.Trim();
            pedido.ValorTotal = dto.ValorTotal;
            pedido.CondicaoPagamento = string.IsNullOrWhiteSpace(dto.CondicaoPagamento) ? pedido.CondicaoPagamento : dto.CondicaoPagamento.Trim();
            pedido.DataSugeridaProva = ParseDateOnly(dto.DataSugeridaProva);

            var novaDataEntrega = ParseDateOnly(dto.DataPrevistaEntrega);
            if (novaDataEntrega.HasValue)
            {
                pedido.DataPrevistaEntrega = novaDataEntrega.Value;
            }

            pedido.Prioridade = dto.Prioridade;
            pedido.DetalhesObservacoes = string.IsNullOrWhiteSpace(dto.DetalhesObservacoes) ? null : dto.DetalhesObservacoes.Trim();

            if (!string.IsNullOrWhiteSpace(dto.StatusAtual) && pedido.StatusAtual != dto.StatusAtual.Trim())
            {
                pedido.StatusAtual = dto.StatusAtual.Trim();
                AplicarTimestampPorStatus(pedido, pedido.StatusAtual);
            }

            await _context.SaveChangesAsync();
            await _context.Entry(pedido).Reference(p => p.IdClienteNavigation).LoadAsync();

            return Ok(pedido);
        }

        // PATCH: api/pedidos/5/status
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdatePedidoStatusDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.StatusAtual))
            {
                return BadRequest(new { message = "O novo status é obrigatório." });
            }

            var pedido = await _context.Pedidos
                .Include(p => p.IdClienteNavigation)
                .FirstOrDefaultAsync(p => p.IdPedido == id);

            if (pedido == null)
            {
                return NotFound(new { message = "Pedido não encontrado." });
            }

            pedido.StatusAtual = dto.StatusAtual.Trim();
            AplicarTimestampPorStatus(pedido, pedido.StatusAtual);

            await _context.SaveChangesAsync();

            return Ok(pedido);
        }

        // POST: api/pedidos/5/anotacoes
        [HttpPost("{id}/anotacoes")]
        public async Task<IActionResult> AddAnotacao(int id, [FromBody] CreateAnotacaoDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.TextoComentario))
            {
                return BadRequest(new { message = "O texto da anotação é obrigatório." });
            }

            var pedidoExiste = await _context.Pedidos.AnyAsync(p => p.IdPedido == id);
            if (!pedidoExiste)
            {
                return NotFound(new { message = "Pedido não encontrado." });
            }

            var idUsuarioValido = dto.IdUsuario ?? await _context.Usuarios
                .Select(u => u.IdUsuario)
                .FirstOrDefaultAsync();

            if (idUsuarioValido <= 0)
            {
                idUsuarioValido = 1;
            }

            var agora = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Unspecified);

            var anotacao = new PedidoAnotaco
            {
                IdPedido = id,
                IdUsuario = idUsuarioValido,
                TipoTag = string.IsNullOrWhiteSpace(dto.TipoTag) ? "Observação" : dto.TipoTag.Trim(),
                TextoComentario = dto.TextoComentario.Trim(),
                DataRegisto = agora
            };

            _context.PedidoAnotacoes.Add(anotacao);
            await _context.SaveChangesAsync();

            return Ok(anotacao);
        }

        // DELETE: api/pedidos/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePedido(int id)
        {
            var pedido = await _context.Pedidos.FindAsync(id);
            if (pedido == null)
            {
                return NotFound();
            }

            _context.Pedidos.Remove(pedido);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private static void AplicarTimestampPorStatus(Pedido pedido, string status)
        {
            var agora = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Unspecified);

            switch (status.ToLowerInvariant())
            {
                case "corte & tecido":
                    pedido.DataCorteTecido ??= agora;
                    break;
                case "1ª prova realizada":
                    pedido.DataProvaRealizada ??= agora;
                    break;
                case "em produção":
                    pedido.DataInicioProducao ??= agora;
                    break;
                case "pronto p/ entrega":
                    pedido.DataProntoEntrega ??= agora;
                    break;
                case "entregue":
                    pedido.DataEntregue ??= agora;
                    break;
            }
        }

        private static DateOnly? ParseDateOnly(string? rawDate)
        {
            if (string.IsNullOrWhiteSpace(rawDate))
            {
                return null;
            }

            if (DateOnly.TryParse(rawDate, out var dateOnly))
            {
                return dateOnly;
            }

            if (DateTime.TryParse(rawDate, out var dateTime))
            {
                return DateOnly.FromDateTime(dateTime);
            }

            return null;
        }
    }

    public class CreatePedidoDto
    {
        public int IdCliente { get; set; }
        public string TipoPeca { get; set; } = string.Empty;
        public decimal ValorTotal { get; set; }
        public string? CondicaoPagamento { get; set; }
        public string? DataPedido { get; set; }
        public string? DataSugeridaProva { get; set; }
        public string? DataPrevistaEntrega { get; set; }
        public bool Prioridade { get; set; }
        public string? StatusAtual { get; set; }
        public string? DetalhesObservacoes { get; set; }
    }

    public class UpdatePedidoStatusDto
    {
        public string StatusAtual { get; set; } = string.Empty;
    }

    public class CreateAnotacaoDto
    {
        public int? IdUsuario { get; set; }
        public string? TipoTag { get; set; }
        public string TextoComentario { get; set; } = string.Empty;
    }
}
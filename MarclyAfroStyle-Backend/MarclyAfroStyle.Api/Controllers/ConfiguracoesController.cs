using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MarclyAfroStyle.Api.Data;
using MarclyAfroStyle.Api.Models;

namespace MarclyAfroStyle.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ConfiguracoesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ConfiguracoesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/configuracoes
        [HttpGet]
        public async Task<IActionResult> GetConfiguracoes()
        {
            var config = await _context.ConfiguracoesAtelies
                .OrderBy(c => c.IdConfiguracao)
                .FirstOrDefaultAsync();

            if (config == null)
            {
                config = new ConfiguracoesAtelie
                {
                    NomeAtelie = "Marcly Afro Style",
                    NomeResponsavel = "Marcly Ramos",
                    Slogan = "Moda Afro sob medida e elegância",
                    WhatsappComercial = "(69) 99999-9999",
                    EmailContato = "contato@marclyafrostyle.com.br",
                    EnderecoAtelie = "Rua Duarte da Costa, nº 1631, São Sebastião, Porto Velho - RO",
                    ChavePix = "pix@marclyafrostyle.com.br",
                    MsgWhatsappAtiva = true,
                    MsgWhatsappTemplate = "Olá, [Nome da Cliente]! Aqui é a Marcly do Ateliê Marcly Afro Style. Seu pedido do [Nome da Peça] foi confirmado com muito carinho! Sua 1ª prova presencial está pré-agendada para [Data da Prova]."
                };

                _context.ConfiguracoesAtelies.Add(config);
                await _context.SaveChangesAsync();
            }

            return Ok(config);
        }

        // PUT: api/configuracoes
        [HttpPut]
        public async Task<IActionResult> UpdateConfiguracoes([FromBody] UpdateConfiguracoesDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.NomeAtelie) ||
                string.IsNullOrWhiteSpace(dto.WhatsappComercial) ||
                string.IsNullOrWhiteSpace(dto.EmailContato))
            {
                return BadRequest(new { message = "Nome do ateliê, WhatsApp comercial e e-mail são obrigatórios." });
            }

            var config = await _context.ConfiguracoesAtelies
                .OrderBy(c => c.IdConfiguracao)
                .FirstOrDefaultAsync();

            if (config == null)
            {
                config = new ConfiguracoesAtelie
                {
                    NomeResponsavel = string.IsNullOrWhiteSpace(dto.NomeResponsavel) ? "Marcly Ramos" : dto.NomeResponsavel.Trim()
                };
                _context.ConfiguracoesAtelies.Add(config);
            }

            config.NomeAtelie = dto.NomeAtelie.Trim();
            if (!string.IsNullOrWhiteSpace(dto.NomeResponsavel))
            {
                config.NomeResponsavel = dto.NomeResponsavel.Trim();
            }
            config.Slogan = string.IsNullOrWhiteSpace(dto.Slogan) ? null : dto.Slogan.Trim();
            config.WhatsappComercial = dto.WhatsappComercial.Trim();
            config.EmailContato = dto.EmailContato.Trim();
            config.EnderecoAtelie = string.IsNullOrWhiteSpace(dto.EnderecoAtelie) ? null : dto.EnderecoAtelie.Trim();
            config.ChavePix = string.IsNullOrWhiteSpace(dto.ChavePix) ? null : dto.ChavePix.Trim();
            config.MsgWhatsappAtiva = dto.MsgWhatsappAtiva;
            config.MsgWhatsappTemplate = string.IsNullOrWhiteSpace(dto.MsgWhatsappTemplate) ? null : dto.MsgWhatsappTemplate.Trim();

            await _context.SaveChangesAsync();

            return Ok(config);
        }

        // PATCH: api/configuracoes/whatsapp
        [HttpPatch("whatsapp")]
        public async Task<IActionResult> ToggleWhatsapp([FromBody] ToggleWhatsappDto dto)
        {
            var config = await _context.ConfiguracoesAtelies
                .OrderBy(c => c.IdConfiguracao)
                .FirstOrDefaultAsync();

            if (config == null)
            {
                return NotFound(new { message = "Configurações não encontradas." });
            }

            config.MsgWhatsappAtiva = dto.MsgWhatsappAtiva;
            await _context.SaveChangesAsync();

            return Ok(config);
        }
    }

    public class UpdateConfiguracoesDto
    {
        public string NomeAtelie { get; set; } = string.Empty;
        public string? NomeResponsavel { get; set; }
        public string? Slogan { get; set; }
        public string WhatsappComercial { get; set; } = string.Empty;
        public string EmailContato { get; set; } = string.Empty;
        public string? EnderecoAtelie { get; set; }
        public string? ChavePix { get; set; }
        public bool MsgWhatsappAtiva { get; set; }
        public string? MsgWhatsappTemplate { get; set; }
    }

    public class ToggleWhatsappDto
    {
        public bool MsgWhatsappAtiva { get; set; }
    }
}
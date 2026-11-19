using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MarclyAfroStyle.Api.Data;
using MarclyAfroStyle.Api.Models;

namespace MarclyAfroStyle.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Senha))
            {
                return BadRequest(new { message = "Informe o e-mail e a senha." });
            }

            // Garante um usuário administrador inicial caso a tabela ainda esteja vazia
            if (!await _context.Usuarios.AnyAsync())
            {
                var adminInicial = new Usuario
                {
                    NomeCompleto = "Marcly Silva",
                    Email = "marcly@marclyafrostyle.com.br",
                    SenhaHash = GerarHashSha256("Marcly@2026"),
                    PerfilAcesso = "Administrador",
                    Ativo = true,
                    DataCriacao = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Unspecified)
                };
                _context.Usuarios.Add(adminInicial);
                await _context.SaveChangesAsync();
            }

            var emailNormalizado = dto.Email.Trim().ToLowerInvariant();
            var senhaInformada = dto.Senha.Trim();
            var senhaHash = GerarHashSha256(senhaInformada);

            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Email.ToLower() == emailNormalizado && u.Ativo);

            if (usuario == null || (usuario.SenhaHash != senhaHash && usuario.SenhaHash != senhaInformada))
            {
                return Unauthorized(new { message = "E-mail ou senha inválidos." });
            }

            return Ok(new
            {
                usuario.IdUsuario,
                usuario.NomeCompleto,
                usuario.Email,
                usuario.PerfilAcesso
            });
        }

        private static string GerarHashSha256(string texto)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(texto));
            return Convert.ToHexString(bytes).ToLowerInvariant();
        }
    }

    public class LoginRequestDto
    {
        public string Email { get; set; } = string.Empty;
        public string Senha { get; set; } = string.Empty;
    }
}
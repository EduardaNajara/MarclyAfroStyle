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
    public class UsuariosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsuariosController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/usuarios
        [HttpGet]
        public async Task<IActionResult> GetUsuarios()
        {
            var usuarios = await _context.Usuarios
                .Where(u => u.Ativo)
                .OrderBy(u => u.IdUsuario)
                .Select(u => new
                {
                    u.IdUsuario,
                    u.NomeCompleto,
                    u.Email,
                    u.PerfilAcesso,
                    u.Ativo,
                    u.DataCriacao
                })
                .ToListAsync();

            return Ok(usuarios);
        }

        // POST: api/usuarios
        [HttpPost]
        public async Task<IActionResult> CreateUsuario([FromBody] CreateUsuarioDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.NomeCompleto) ||
                string.IsNullOrWhiteSpace(dto.Email) ||
                string.IsNullOrWhiteSpace(dto.Senha))
            {
                return BadRequest(new { message = "Nome completo, e-mail e senha são obrigatórios." });
            }

            if (dto.Senha.Trim().Length < 8)
            {
                return BadRequest(new { message = "A senha deve ter pelo menos 8 caracteres." });
            }

            var emailNormalizado = dto.Email.Trim().ToLowerInvariant();
            var existente = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Email.ToLower() == emailNormalizado);

            if (existente != null && existente.Ativo)
            {
                return Conflict(new { message = "Já existe um usuário cadastrado com este e-mail." });
            }

            var perfil = string.IsNullOrWhiteSpace(dto.PerfilAcesso)
                ? "Perfil comum"
                : dto.PerfilAcesso.Trim();

            if (existente != null && !existente.Ativo)
            {
                existente.NomeCompleto = dto.NomeCompleto.Trim();
                existente.SenhaHash = GerarHashSha256(dto.Senha.Trim());
                existente.PerfilAcesso = perfil;
                existente.Ativo = true;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    existente.IdUsuario,
                    existente.NomeCompleto,
                    existente.Email,
                    existente.PerfilAcesso,
                    existente.Ativo,
                    existente.DataCriacao
                });
            }

            var novoUsuario = new Usuario
            {
                NomeCompleto = dto.NomeCompleto.Trim(),
                Email = emailNormalizado,
                SenhaHash = GerarHashSha256(dto.Senha.Trim()),
                PerfilAcesso = perfil,
                Ativo = true,
                DataCriacao = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Unspecified)
            };

            _context.Usuarios.Add(novoUsuario);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                novoUsuario.IdUsuario,
                novoUsuario.NomeCompleto,
                novoUsuario.Email,
                novoUsuario.PerfilAcesso,
                novoUsuario.Ativo,
                novoUsuario.DataCriacao
            });
        }

        // DELETE: api/usuarios/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUsuario(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null)
            {
                return NotFound(new { message = "Usuário não encontrado." });
            }

            var possuiAnotacoes = await _context.PedidoAnotacoes.AnyAsync(a => a.IdUsuario == id);
            if (possuiAnotacoes)
            {
                usuario.Ativo = false;
            }
            else
            {
                _context.Usuarios.Remove(usuario);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        private static string GerarHashSha256(string texto)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(texto));
            return Convert.ToHexString(bytes).ToLowerInvariant();
        }
    }

    public class CreateUsuarioDto
    {
        public string NomeCompleto { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Senha { get; set; } = string.Empty;
        public string? PerfilAcesso { get; set; }
    }
}
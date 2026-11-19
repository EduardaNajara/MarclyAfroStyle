using System;
using System.Collections.Generic;

namespace MarclyAfroStyle.Api.Models;

public partial class Usuario
{
    public int IdUsuario { get; set; }

    public string NomeCompleto { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string SenhaHash { get; set; } = null!;

    public string PerfilAcesso { get; set; } = null!;

    public bool Ativo { get; set; }

    public DateTime DataCriacao { get; set; }

    public virtual ICollection<PedidoAnotaco> PedidoAnotacos { get; set; } = new List<PedidoAnotaco>();
}

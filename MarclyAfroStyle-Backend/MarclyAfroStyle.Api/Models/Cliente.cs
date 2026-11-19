using System;
using System.Collections.Generic;

namespace MarclyAfroStyle.Api.Models;

public partial class Cliente
{
    public int IdCliente { get; set; }

    public string NomeCompleto { get; set; } = null!;

    public string Telefone { get; set; } = null!;

    public string? Email { get; set; }

    public string? Localizacao { get; set; }

    public DateOnly? DataNascimento { get; set; }

    public string? TecidoPreferencia { get; set; }

    public decimal? MedidaBusto { get; set; }

    public decimal? MedidaCintura { get; set; }

    public decimal? MedidaQuadril { get; set; }

    public decimal? MedidaComprimento { get; set; }

    public string? Observacoes { get; set; }

    public bool Ativo { get; set; }

    public DateTime DataRegisto { get; set; }

    public virtual ICollection<Pedido> Pedidos { get; set; } = new List<Pedido>();
}

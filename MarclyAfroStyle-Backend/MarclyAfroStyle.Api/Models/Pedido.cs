using System;
using System.Collections.Generic;

namespace MarclyAfroStyle.Api.Models;

public partial class Pedido
{
    public int IdPedido { get; set; }

    public int IdCliente { get; set; }

    public string TipoPeca { get; set; } = null!;

    public decimal ValorTotal { get; set; }

    public string CondicaoPagamento { get; set; } = null!;

    public DateOnly DataPedido { get; set; }

    public DateOnly? DataSugeridaProva { get; set; }

    public DateOnly DataPrevistaEntrega { get; set; }

    public bool Prioridade { get; set; }

    public string StatusAtual { get; set; } = null!;

    public string? DetalhesObservacoes { get; set; }

    public DateTime? DataCorteTecido { get; set; }

    public DateTime? DataProvaRealizada { get; set; }

    public DateTime? DataInicioProducao { get; set; }

    public DateTime? DataProntoEntrega { get; set; }

    public DateTime? DataEntregue { get; set; }

    public virtual Cliente IdClienteNavigation { get; set; } = null!;

    public virtual ICollection<PedidoAnotaco> PedidoAnotacos { get; set; } = new List<PedidoAnotaco>();
}

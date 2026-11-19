using System;
using System.Collections.Generic;

namespace MarclyAfroStyle.Api.Models;

public partial class PedidoAnotaco
{
    public int IdAnotacao { get; set; }

    public int IdPedido { get; set; }

    public int IdUsuario { get; set; }

    public string TipoTag { get; set; } = null!;

    public string TextoComentario { get; set; } = null!;

    public DateTime DataRegisto { get; set; }

    public virtual Pedido IdPedidoNavigation { get; set; } = null!;

    public virtual Usuario IdUsuarioNavigation { get; set; } = null!;
}

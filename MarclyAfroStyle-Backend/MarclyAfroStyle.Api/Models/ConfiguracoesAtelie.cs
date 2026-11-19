using System;
using System.Collections.Generic;

namespace MarclyAfroStyle.Api.Models;

public partial class ConfiguracoesAtelie
{
    public int IdConfiguracao { get; set; }

    public string NomeAtelie { get; set; } = null!;

    public string NomeResponsavel { get; set; } = null!;

    public string? Slogan { get; set; }

    public string? LogoUrl { get; set; }

    public string WhatsappComercial { get; set; } = null!;

    public string EmailContato { get; set; } = null!;

    public string? EnderecoAtelie { get; set; }

    public string? ChavePix { get; set; }

    public bool MsgWhatsappAtiva { get; set; }

    public string? MsgWhatsappTemplate { get; set; }
}

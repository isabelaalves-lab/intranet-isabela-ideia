// Imagem com as 5 marcas: Italac, Italakinho, Italac PROPLAY, Chocky e Nilza
const ASSINATURA_LOGOS_SRC = 'assets/assinatura-logos.png';

const ASSINATURA_POLITICA = 'Esta mensagem é destinada exclusivamente para fins profissionais, para a(s) pessoa(s) a quem é dirigida, podendo conter informação confidencial e legalmente privilegiada. Ao recebê-la, se você não for destinatário desta mensagem, fica automaticamente notificado de abster-se a divulgar, copiar, distribuir, examinar ou, de qualquer forma, utilizar sua informação, por configurar ato ilegal. Caso você tenha recebido esta mensagem indevidamente, solicitamos que nos retorne este e-mail, promovendo, concomitantemente, sua eliminação de sua base de dados, registros ou qualquer outro sistema de controle. Fica desprovida de eficácia e validade a mensagem que contiver vínculos obrigacionais, expedida por quem não detenha poderes de representação, bem como não esteja legalmente habilitado para utilizar o referido endereço eletrônico, configurando falta grave conforme nossa política de privacidade corporativa. As informações nela contidas são de propriedade da Italac, podendo ser divulgadas apenas a quem de direito e devidamente reconhecido pela empresa.';

function assinaturaHtml(u) {
  u = u || me();
  if (!u) return '';
  const nome = esc(u.nomeCompleto || '');
  const setorValor = esc((u.cargo && u.setor) ? (u.cargo + ' | ' + u.setor) : (u.cargo || u.setor || ''));
  return '<table role="presentation" cellpadding="0" cellspacing="0" border="0" ' +
    'style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1A237E;line-height:1.35">' +
    '<tr>' +
      '<td style="vertical-align:top;padding:0">' +
        '<div style="font-size:18px;font-weight:700;color:#1A237E">' + nome + '</div>' +
      '</td>' +
      '<td style="vertical-align:top;padding:0 0 0 14px;border-left:2px solid #5C96C2;font-size:14px">' +
        '<div style="color:#5C96C2;font-weight:700;font-size:16px">' + setorValor + '</div>' +
        '<div style="color:#1A237E;font-size:13px">Tel. (11) 3014-4492</div>' +
      '</td>' +
    '</tr>' +
    '<tr>' +
      '<td colspan="2" style="padding:14px 0 6px; margin-left:100px">' +
        '<img src="' + esc(ASSINATURA_LOGOS_SRC) + '" ' +
          'alt="Italac | Italakinho | Italac PROPLAY | Chocky | Nilza" ' +
          'style="width:480px;max-width:100%;height:auto;display:block;margin:0 auto">' +
      '</td>' +
    '</tr>' +
    '<tr>' +
      '<td colspan="2" style="padding:6px 0 0;text-align:center">' +
        '<div style="color:#1A237E;font-size:11px">Política de Privacidade</div>' +
        '<div style="font-size:11px;color:#1A237E;text-align:justify;line-height:1.4;margin-top:4px">' +
          esc(ASSINATURA_POLITICA) + '</div>' +
      '</td>' +
    '</tr>' +
  '</table>';
}
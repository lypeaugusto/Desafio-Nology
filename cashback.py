from typing import Dict

def calcular_cashback(valor_final: float, is_vip: bool) -> Dict[str, float]:
    """
    Regras aplicadas (conforme documentos):
    - Cashback base = 5% sobre o valor final (após descontos).
    - VIP recebe 10% de bônus sobre o cashback base (calcular o bônus sobre o base, depois somar).
    - Promoção: se o valor final for > 500, o cashback (base + bônus) é dobrado (vale para todos).

    Ordem implementada: base -> bônus VIP -> aplicar dobra (se aplicável).
    """
    valor_final = float(valor_final)
    cashback_base = valor_final * 0.05

    cashback_bonus = cashback_base * 0.10 if is_vip else 0.0

    subtotal = cashback_base + cashback_bonus

    if valor_final > 500:
        subtotal *= 2

    cashback_final = round(subtotal, 2)

    return {
        "valor_final": round(valor_final, 2),
        "cashback_base": round(cashback_base, 2),
        "cashback_bonus": round(cashback_bonus, 2),
        "cashback_final": cashback_final,
    }

def compute_from_price(preco_original: float, desconto_percent: float, is_vip: bool) -> Dict[str, float]:
    desconto_percent = float(desconto_percent or 0.0)
    preco_original = float(preco_original)
    valor_final = preco_original * (1 - desconto_percent/100.0)
    resultado = calcular_cashback(valor_final, is_vip)
    resultado.update({"preco_original": round(preco_original, 2), "desconto_percent": round(desconto_percent, 2)})
    return resultado

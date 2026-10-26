# Maré de Aço · Batalha Naval

Jogo web em português contra o computador. HTML, CSS e JavaScript, sem dependências de produção.

## Executar

```sh
cd /workspace/TesteBatalhaNaval
python3 -m http.server 8000
```

Abra o servidor em um navegador, ou abra `index.html` diretamente.

Posicione os cinco navios no seu tabuleiro (use **Girar** ou **R** para mudar a orientação) ou use **Distribuir automaticamente**. Clique em **Iniciar batalha** e ataque coordenadas no radar inimigo. Os turnos alternam mesmo após acertos. Vence quem afundar toda a frota adversária. Navios podem se tocar, mas não se sobrepor.

## Testes

```sh
node --test tests/game.test.cjs
```

Cobrem limites e sobreposição, geração de 500 frotas, ataques repetidos, afundamento e vitória.

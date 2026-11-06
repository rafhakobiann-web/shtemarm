import type { MathTopic } from "./mathHandbookTypes";

export const MATH_ADDITIONAL_EXPLANATIONS: MathTopic[] = [
  {
    id:"geometric-progression-worked",category:"sequences",
    title:{hy:"Երկրաչափական պրոգրեսիա՝ քայլ առ քայլ",en:"Geometric progression step by step",ru:"Геометрическая прогрессия по шагам"},
    summary:{hy:"Երկրաչափական պրոգրեսիայում յուրաքանչյուր հաջորդ անդամը ստացվում է նախորդը նույն q թվով բազմապատկելով։",en:"Each term of a geometric progression is the preceding term multiplied by the same ratio q.",ru:"Каждый следующий член геометрической прогрессии равен предыдущему, умноженному на одно и то же число q."},
    formula:"$b_n=b_1q^{n-1},\\quad S_n=\\frac{b_1(1-q^n)}{1-q}\\quad(q\\ne1)$",
    problem:{hy:"Տրված է 2, 6, 18, …։ Գտիր չորրորդ անդամը և առաջին չորս անդամների գումարը։",en:"Given 2, 6, 18, …, find the fourth term and the sum of the first four.",ru:"Дано 2, 6, 18, … . Найдите четвёртый член и сумму первых четырёх."},
    steps:{
      hy:["Գտնում ենք հայտարարը՝ q = 6/2 = 3։ Ստուգում՝ 18/6 = 3։","Չորրորդ անդամը՝ b₄ = 2 · 3³ = 54։","Գումարը՝ S₄ = 2 + 6 + 18 + 54 = 80։"],
      en:["Find q = 6/2 = 3 and verify 18/6 = 3.","The fourth term is b₄ = 2 · 3³ = 54.","Sum: S₄ = 2 + 6 + 18 + 54 = 80."],
      ru:["Найдём q = 6/2 = 3; проверим 18/6 = 3.","Четвёртый член: b₄ = 2 · 3³ = 54.","Сумма: S₄ = 2 + 6 + 18 + 54 = 80."]
    },answer:"$b_4=54,\\quad S_4=80$",
    mistake:{hy:"Մի՛ շփոթիր թվաբանական պրոգրեսիայի տարբերությունը երկրաչափական պրոգրեսիայի հարաբերության հետ։",en:"Do not confuse the common difference of an arithmetic sequence with the common ratio of a geometric one.",ru:"Не путайте разность арифметической прогрессии со знаменателем геометрической."}
  },
  {
    id:"linear-inequality-negative-worked",category:"inequalities",
    title:{hy:"Անհավասարություն՝ բացասական թվի բաժանում",en:"Inequalities: dividing by a negative",ru:"Неравенства: деление на отрицательное число"},
    summary:{hy:"Երբ անհավասարության երկու կողմերը բաժանում կամ բազմապատկում ենք բացասական թվով, նշանը փոխում է ուղղությունը։",en:"Multiplying or dividing both sides of an inequality by a negative number reverses its direction.",ru:"При умножении или делении обеих частей неравенства на отрицательное число знак меняет направление."},
    formula:"$a<b,\\quad c<0\\Rightarrow ac>bc$",
    problem:{hy:"Լուծիր −2x + 4 > 10 անհավասարությունը։",en:"Solve −2x + 4 > 10.",ru:"Решите −2x + 4 > 10."},
    steps:{
      hy:["Երկու կողմերից հանում ենք 4՝ −2x > 6։","Բաժանում ենք −2-ի և շրջում նշանը՝ x < −3։","Ստուգում՝ x = −4 դեպքում 8 + 4 = 12 > 10։"],
      en:["Subtract 4 from both sides: −2x > 6.","Divide by −2 and reverse the sign: x < −3.","Check x = −4: 8 + 4 = 12 > 10."],
      ru:["Вычтем 4: −2x > 6.","Разделим на −2 и поменяем знак: x < −3.","Проверим x = −4: 8 + 4 = 12 > 10."]
    },answer:"$x<-3$",
    mistake:{hy:"−2-ի բաժանելիս > նշանը չշրջելը սխալ պատասխան է տալիս։",en:"Forgetting to reverse > when dividing by −2 gives the wrong solution set.",ru:"Если не поменять > при делении на −2, получится неверный ответ."}
  }
];

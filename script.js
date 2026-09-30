const DEST="5512997479192";
const $=id=>document.getElementById(id);

// radios Sim/Não (ou opções customizadas)
document.querySelectorAll(".yn").forEach(g=>{
  const n=g.dataset.n,opts=(g.dataset.o||"Sim,Não").split(",");
  g.innerHTML=opts.map(o=>`<label><input type="radio" name="${n}" value="${o}">${o}</label>`).join("");
});
const val=n=>{const r=document.querySelector(`input[name="${n}"]:checked`);return r?r.value:""};
document.querySelectorAll('input[name="compor"]').forEach(r=>r.onchange=()=>$("boxOutra").classList.toggle("hide",val("compor")!=="Sim"));
document.querySelectorAll('input[name="fgts"]').forEach(r=>r.onchange=()=>$("boxSaldo").classList.toggle("hide",val("fgts")!=="Sim"));

// máscaras
$("cpf").addEventListener("input",e=>{
  let v=e.target.value.replace(/\D/g,"").slice(0,11);
  v=v.replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d{1,2})$/,"$1-$2");
  e.target.value=v;
});
document.querySelectorAll(".m").forEach(el=>el.addEventListener("input",e=>{
  const d=e.target.value.replace(/\D/g,"");
  if(!d){e.target.value="";return}
  e.target.value=(parseInt(d,10)/100).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
}));

function cpfOk(c){
  c=c.replace(/\D/g,"");
  if(c.length!==11||/^(\d)\1+$/.test(c))return false;
  for(let t=9;t<11;t++){
    let s=0;for(let i=0;i<t;i++)s+=c[i]*(t+1-i);
    if((s*10%11)%10!=c[t])return false;
  }
  return true;
}
const fmtData=s=>s?s.split("-").reverse().join("/"):"";

$("enviar").onclick=()=>{
  document.querySelectorAll(".bad").forEach(e=>e.classList.remove("bad"));
  const obrig=["cpf","nasc","civil","cidade","renda","prof","valor","cidImovel","entrada"];
  const radios=["compor","condicao","fgts","tres","usou","possui","teve","subs"];
  let erro="";
  obrig.forEach(id=>{if(!$(id).value.trim()){$(id).classList.add("bad");erro="Preencha todos os campos obrigatórios."}});
  if($("cpf").value&&!cpfOk($("cpf").value)){$("cpf").classList.add("bad");erro="CPF inválido."}
  if(val("compor")==="Sim"&&!$("outra").value){$("outra").classList.add("bad");erro="Informe a renda da outra pessoa."}
  if(val("fgts")==="Sim"&&!$("saldo").value){$("saldo").classList.add("bad");erro="Informe o saldo aproximado do FGTS."}
  if(radios.some(n=>!val(n)))erro=erro||"Responda todas as perguntas de Sim/Não.";
  $("geral").textContent=erro;$("geral").className="er";
  if(erro){(document.querySelector(".bad")||$("geral")).scrollIntoView({behavior:"smooth",block:"center"});return}

  const msg=`🏠 *DADOS PARA SIMULAÇÃO*

*1. DADOS PESSOAIS*
CPF: ${$("cpf").value}
Nascimento: ${fmtData($("nasc").value)}
Estado civil: ${$("civil").value}
Cidade onde mora: ${$("cidade").value.trim()}

*2. RENDA*
Renda bruta: ${$("renda").value}
Profissão/atividade: ${$("prof").value.trim()}
Vai compor renda? ${val("compor")}${val("compor")==="Sim"?"\nRenda da outra pessoa: "+$("outra").value:""}

*3. IMÓVEL*
Valor do imóvel: ${$("valor").value}
Novo ou usado: ${val("condicao")}
Cidade do imóvel: ${$("cidImovel").value.trim()}
Valor da entrada: ${$("entrada").value}

*4. FGTS*
Possui FGTS? ${val("fgts")}${val("fgts")==="Sim"?"\nSaldo aproximado: "+$("saldo").value:""}
3 anos ou mais de carteira assinada, somando os períodos? ${val("tres")}
Já usou FGTS para comprar imóvel? ${val("usou")}

*5. SITUAÇÃO ATUAL*
Possui imóvel residencial em seu nome? ${val("possui")}
Já teve financiamento habitacional? ${val("teve")}
Já recebeu subsídio habitacional? ${val("subs")}`;

  window.open(`https://wa.me/${DEST}?text=${encodeURIComponent(msg)}`,"_blank");
};

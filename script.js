const DEST="5512997479192";
const $=id=>document.getElementById(id);

/* ---------- Radios Sim/Não ---------- */
document.querySelectorAll(".yn").forEach(g=>{
  const n=g.dataset.n,opts=(g.dataset.o||"Sim,Não").split(",");
  g.innerHTML=opts.map(o=>`<label><input type="radio" name="${n}" value="${o}">${o}</label>`).join("");
});
const val=n=>{const r=document.querySelector(`input[name="${n}"]:checked`);return r?r.value:""};
document.querySelectorAll('input[name="compor"]').forEach(r=>r.onchange=()=>$("boxOutra").classList.toggle("hide",val("compor")!=="Sim"));
document.querySelectorAll('input[name="fgts"]').forEach(r=>r.onchange=()=>$("boxSaldo").classList.toggle("hide",val("fgts")!=="Sim"));

/* ---------- Estado -> Cidade (API do IBGE) ---------- */
const UFS="AC,AL,AM,AP,BA,CE,DF,ES,GO,MA,MG,MS,MT,PA,PB,PE,PI,PR,RJ,RN,RO,RR,RS,SC,SE,SP,TO".split(",");
const cache={};
function geo(id){
  $(id).innerHTML=`<select id="${id}_uf"><option value="">Estado</option>${UFS.map(u=>`<option>${u}</option>`).join("")}</select>
<select id="${id}_c" disabled><option value="">Escolha o estado primeiro</option></select>
<input id="${id}_t" type="text" class="hide" placeholder="Digite a cidade">`;
  const uf=$(id+"_uf"),c=$(id+"_c"),t=$(id+"_t");
  uf.onchange=async()=>{
    const u=uf.value;t.classList.add("hide");t.value="";c.classList.remove("hide");
    if(!u){c.disabled=true;c.innerHTML='<option value="">Escolha o estado primeiro</option>';return}
    c.disabled=true;c.innerHTML='<option value="">Carregando cidades...</option>';
    try{
      if(!cache[u]){
        const r=await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${u}/municipios?orderBy=nome`);
        if(!r.ok)throw 0;
        cache[u]=(await r.json()).map(m=>m.nome);
      }
      c.innerHTML='<option value="">Selecione a cidade</option>'+cache[u].map(n=>`<option>${n}</option>`).join("");
      c.disabled=false;
    }catch(e){ // sem internet/IBGE fora: campo de texto
      c.classList.add("hide");t.classList.remove("hide");
    }
  };
}
const geoVal=id=>{
  const u=$(id+"_uf").value,t=$(id+"_t"),c=$(id+"_c");
  const cid=t.classList.contains("hide")?c.value:t.value.trim();
  return u&&cid?`${cid} - ${u}`:"";
};
["nat","mora","imv"].forEach(geo);

/* ---------- Profissões ---------- */
const PROFS=["Administrador(a)","Advogado(a)","Aposentado(a)/Pensionista","Arquiteto(a)","Assistente administrativo","Atendente","Autônomo(a)","Auxiliar de serviços gerais","Balconista","Bancário(a)","Cabeleireiro(a)/Barbeiro(a)","Comerciante","Contador(a)","Cozinheiro(a)","Dentista","Designer","Diarista","Eletricista","Empresário(a)/Sócio(a)","Enfermeiro(a)","Engenheiro(a)","Estudante","Farmacêutico(a)","Funcionário(a) público(a)","Gerente","Jornalista","Mecânico(a)","Médico(a)","Microempreendedor(a) (MEI)","Motorista","Motorista de aplicativo","Militar","Pedreiro(a)/Construção civil","Professor(a)","Programador(a)/TI","Psicólogo(a)","Representante comercial","Segurança/Vigilante","Técnico(a) de enfermagem","Vendedor(a)"];
$("prof").innerHTML='<option value="">Selecione</option>'+PROFS.map(p=>`<option>${p}</option>`).join("")+'<option value="Outros">Outros</option>';
$("prof").onchange=()=>$("boxProf").classList.toggle("hide",$("prof").value!=="Outros");
const profVal=()=>$("prof").value==="Outros"?$("profOutra").value.trim():$("prof").value;

/* ---------- Máscaras ---------- */
$("cpf").addEventListener("input",e=>{
  let v=e.target.value.replace(/\D/g,"").slice(0,11);
  v=v.replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d{1,2})$/,"$1-$2");
  e.target.value=v;$("cpfErr").textContent="";e.target.classList.remove("bad");
});
document.querySelectorAll(".m").forEach(el=>el.addEventListener("input",e=>{
  const d=e.target.value.replace(/\D/g,"");
  if(!d){e.target.value="";return}
  e.target.value=(parseInt(d,10)/100).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
}));
const num=s=>parseInt((s||"").replace(/\D/g,"")||"0",10)/100;
const brl=n=>n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

/* ---------- CPF ---------- */
function cpfOk(c){
  c=c.replace(/\D/g,"");
  if(c.length!==11||/^(\d)\1+$/.test(c))return false;
  for(let t=9;t<11;t++){
    let s=0;for(let i=0;i<t;i++)s+=c[i]*(t+1-i);
    if((s*10%11)%10!=c[t])return false;
  }
  return true;
}
function checkCpf(){
  const v=$("cpf").value,bad=v&&!cpfOk(v);
  $("cpf").classList.toggle("bad",!!bad);
  $("cpfErr").textContent=bad?"CPF inválido. Confira os números.":"";
  return !bad;
}
$("cpf").addEventListener("blur",checkCpf);

/* ---------- Entrada mínima de 20% ---------- */
let entTocada=false;
const minEntrada=()=>Math.round(num($("valor").value)*20)/100; // 20% em reais
function checkEntrada(){
  const min=minEntrada(),e=num($("entrada").value);
  const bad=min>0&&$("entrada").value&&e<min;
  $("entrada").classList.toggle("bad",!!bad);
  $("entErr").textContent=bad?`A entrada deve ser de no mínimo ${brl(min)} (20% do imóvel).`:"";
  return !bad;
}
$("valor").addEventListener("input",()=>{
  const min=minEntrada();
  $("minEnt").textContent=min>0?`Entrada mínima (20%): ${brl(min)}`:"Informe o valor do imóvel para calcular a entrada mínima (20%).";
  if(min>0&&!entTocada)$("entrada").value=brl(min); // sugere o mínimo
  if(!min&&!entTocada)$("entrada").value="";
  checkEntrada();
});
$("entrada").addEventListener("input",()=>{entTocada=true;checkEntrada()});

const fmtData=s=>s?s.split("-").reverse().join("/"):"";

/* ---------- Envio ---------- */
$("enviar").onclick=()=>{
  document.querySelectorAll(".bad").forEach(e=>e.classList.remove("bad"));
  const obrig=["cpf","nasc","civil","renda","prof","valor","entrada"];
  const radios=["compor","condicao","fgts","tres","usou","possui","teve","subs"];
  let erro="",foco=null;
  const falha=(el,msg)=>{el.classList.add("bad");erro=erro||msg;foco=foco||el};
  obrig.forEach(id=>{if(!$(id).value.trim())falha($(id),"Preencha todos os campos obrigatórios.")});
  [["nat","Informe estado e cidade onde nasceu."],["mora","Informe estado e cidade onde mora."],["imv","Informe estado e cidade do imóvel."]]
    .forEach(([id,m])=>{if(!geoVal(id))falha($(id),m)});
  if($("prof").value==="Outros"&&!$("profOutra").value.trim())falha($("profOutra"),"Digite sua profissão.");
  if($("cpf").value&&!checkCpf())falha($("cpf"),"CPF inválido.");
  if(val("compor")==="Sim"&&!$("outra").value)falha($("outra"),"Informe a renda da outra pessoa.");
  if(val("fgts")==="Sim"&&!$("saldo").value)falha($("saldo"),"Informe o saldo aproximado do FGTS.");
  if($("valor").value&&$("entrada").value&&!checkEntrada())falha($("entrada"),`A entrada deve ser de no mínimo ${brl(minEntrada())} (20% do imóvel).`);
  if(radios.some(n=>!val(n)))erro=erro||"Responda todas as perguntas de Sim/Não.";
  $("geral").textContent=erro;$("geral").className="er";
  if(erro){(foco||$("geral")).scrollIntoView({behavior:"smooth",block:"center"});return}

  const msg=`🏠 *DADOS PARA SIMULAÇÃO*

*1. DADOS PESSOAIS*
CPF: ${$("cpf").value}
Nascimento: ${fmtData($("nasc").value)}
Naturalidade: ${geoVal("nat")}
Estado civil: ${$("civil").value}
Cidade onde mora: ${geoVal("mora")}

*2. RENDA*
Renda bruta: ${$("renda").value}
Profissão/atividade: ${profVal()}
Vai compor renda? ${val("compor")}${val("compor")==="Sim"?"\nRenda da outra pessoa: "+$("outra").value:""}

*3. IMÓVEL*
Valor do imóvel: ${$("valor").value}
Novo ou usado: ${val("condicao")}
Cidade do imóvel: ${geoVal("imv")}
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

//// Somativo 2
// Alunos: Heron Ricardo Rodrigues da Cruz e Rafael Felipe Xavier da Silva

use("marketplaceDB");

//// 2. Inserção e Validação:
// 2.1. Validação
db.createCollection("usuarios", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nome", "email", "senha", "endereco", "criado_em"],
      properties: {
        nome: { bsonType: "string", description: "Nome do usuário" },
        email: { bsonType: "string", description: "Email do usuário" },
        senha: { bsonType: "string", description: "Senha do usuário" },
        endereco: {
          bsonType: "object",
          required: ["logradouro", "cidade", "estado", "cep"],
          properties: {
            logradouro: { bsonType: "string" },
            cidade: { bsonType: "string" },
            estado: { bsonType: "string" },
            cep: { bsonType: "string" }
          }
        },
        criado_em: { bsonType: "date" },
        deletado_em: { bsonType: ["date", "null"] }
      }
    }
  }
});

db.createCollection("produtos", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nome", "descricao", "preco", "quantidade_disponivel", "categoria_id", "criado_em"],
      properties: {
        nome: { bsonType: "string", description: "Nome do produto" },
        descricao: { bsonType: "string", description: "Descrição do produto" },
        preco: { bsonType: "decimal", description: "Preço do produto" },
        quantidade_disponivel: { bsonType: "int" },
        categoria_id: { bsonType: "objectId" },
        avaliacoes: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["usuario_id", "comentario", "estrelas", "avaliado_em"],
            properties: {
              usuario_id: { bsonType: "objectId" },
              comentario: { bsonType: "string" },
              estrelas: { bsonType: "int", minimum: 1, maximum: 5 },
              avaliado_em: { bsonType: "date" }
            }
          }
        },
        criado_em: { bsonType: "date" },
        deletado_em: { bsonType: ["date", "null"] }
      }
    }
  }
});

db.createCollection("transacoes", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["usuario_id", "produto_id", "quantidade", "valor_total", "status", "data_transacao"],
      properties: {
        usuario_id: { bsonType: "objectId" },
        produto_id: { bsonType: "objectId" },
        quantidade: { bsonType: "int" },
        valor_total: { bsonType: "decimal" },
        status: { bsonType: "string", enum: ["pendente", "concluída", "cancelada"] },
        data_transacao: { bsonType: "date" }
      }
    }
  }
});

db.createCollection("categorias", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nome"],
      properties: {
        nome: { bsonType: "string", description: "Nome da categoria ou subcategoria" },
        categoria_pai_id: { bsonType: ["objectId", "null"], description: "Referência à categoria principal, null se for categoria principal" }
      }
    }
  }
});

// Inserindo usuários e capturando seus IDs diretamente
const usuariosInseridos = db.usuarios.insertMany([
  { nome: "Alice Martins", email: "alice.martins@exemplo.com", senha: "senhaSegura1", endereco: { logradouro: "Av. Brasil", cidade: "São Paulo", estado: "SP", cep: "01001-000" }, criado_em: new Date() },
  { nome: "Bruno Souza", email: "bruno.souza@exemplo.com", senha: "senhaSegura2", endereco: { logradouro: "Rua das Flores", cidade: "Rio de Janeiro", estado: "RJ", cep: "20010-123" }, criado_em: new Date() },
  { nome: "Carla Pereira", email: "carla.pereira@exemplo.com", senha: "senhaSegura3", endereco: { logradouro: "Av. Sete de Setembro", cidade: "Curitiba", estado: "PR", cep: "80050-320" }, criado_em: new Date() },
  { nome: "Diego Fernandes", email: "diego.fernandes@exemplo.com", senha: "senhaSegura4", endereco: { logradouro: "Rua das Palmeiras", cidade: "Salvador", estado: "BA", cep: "40020-450" }, criado_em: new Date() },
  { nome: "Elaine Lima", email: "elaine.lima@exemplo.com", senha: "senhaSegura5", endereco: { logradouro: "Av. Atlântica", cidade: "Florianópolis", estado: "SC", cep: "88010-410" }, criado_em: new Date() }
]);

// Usando os IDs dos usuários inseridos
const [usuario1Id, usuario2Id, usuario3Id, usuario4Id, usuario5Id] = Object.values(usuariosInseridos.insertedIds);

// Inserindo categorias principais e capturando os IDs
const roupasId = db.categorias.insertOne({ nome: "Roupas" }).insertedId;
const eletronicosId = db.categorias.insertOne({ nome: "Eletrônicos" }).insertedId;
const livrosId = db.categorias.insertOne({ nome: "Livros" }).insertedId;
const brinquedosId = db.categorias.insertOne({ nome: "Brinquedos" }).insertedId;
const esportesId = db.categorias.insertOne({ nome: "Esportes" }).insertedId;

// Inserindo subcategorias e capturando os IDs
const camisetasId = db.categorias.insertOne({ nome: "Camisetas", categoria_pai_id: roupasId }).insertedId;
const calcasId = db.categorias.insertOne({ nome: "Calças", categoria_pai_id: roupasId }).insertedId;
const celularesId = db.categorias.insertOne({ nome: "Celulares", categoria_pai_id: eletronicosId }).insertedId;
const computadoresId = db.categorias.insertOne({ nome: "Computadores", categoria_pai_id: eletronicosId }).insertedId;
const tecnologiaId = db.categorias.insertOne({ nome: "Tecnologia", categoria_pai_id: livrosId }).insertedId;

// Inserindo produtos com avaliações embutidas
db.produtos.insertMany([
  { 
    nome: "Smartphone X1", 
    descricao: "Smartphone com tela de 6.5 polegadas e 128GB de armazenamento", 
    preco: NumberDecimal("1999.99"), 
    quantidade_disponivel: 25, 
    categoria_id: celularesId, 
    criado_em: new Date(),
    avaliacoes: [
      { usuario_id: usuario1Id, comentario: "Excelente qualidade!", estrelas: 5, avaliado_em: new Date() },
      { usuario_id: usuario2Id, comentario: "Cumpre o que promete.", estrelas: 4, avaliado_em: new Date() }
    ]
  },
  { 
    nome: "Notebook Pro", 
    descricao: "Notebook com processador i7 e 16GB de RAM", 
    preco: NumberDecimal("4999.90"), 
    quantidade_disponivel: 15, 
    categoria_id: computadoresId, 
    criado_em: new Date(),
    avaliacoes: [
      { usuario_id: usuario3Id, comentario: "Perfeito para trabalho e estudos.", estrelas: 5, avaliado_em: new Date() },
      { usuario_id: usuario4Id, comentario: "Um pouco caro, mas vale a pena.", estrelas: 4, avaliado_em: new Date() },
      { usuario_id: usuario5Id, comentario: "Excelente desempenho.", estrelas: 5, avaliado_em: new Date() }
    ]
  },
  { 
    nome: "Camiseta Esportiva", 
    descricao: "Camiseta de tecido leve para atividades esportivas", 
    preco: NumberDecimal("49.90"), 
    quantidade_disponivel: 50, 
    categoria_id: camisetasId, 
    criado_em: new Date(),
    avaliacoes: [
      { usuario_id: usuario1Id, comentario: "Confortável e leve.", estrelas: 5, avaliado_em: new Date() }
    ]
  },
  { 
    nome: "Livro: Aprenda MongoDB", 
    descricao: "Guia completo sobre MongoDB para iniciantes e avançados", 
    preco: NumberDecimal("79.90"), 
    quantidade_disponivel: 40, 
    categoria_id: tecnologiaId, 
    criado_em: new Date(),
    avaliacoes: [
      { usuario_id: usuario2Id, comentario: "Conteúdo excelente para iniciantes.", estrelas: 5, avaliado_em: new Date() },
      { usuario_id: usuario3Id, comentario: "Recomendo para todos que querem aprender MongoDB.", estrelas: 5, avaliado_em: new Date() }
    ]
  },
  { 
    nome: "Bola de Futebol", 
    descricao: "Bola oficial para partidas de futebol", 
    preco: NumberDecimal("89.99"), 
    quantidade_disponivel: 30, 
    categoria_id: esportesId, 
    criado_em: new Date(),
    avaliacoes: [
      { usuario_id: usuario4Id, comentario: "Ótima para partidas casuais.", estrelas: 4, avaliado_em: new Date() },
      { usuario_id: usuario5Id, comentario: "Boa relação custo-benefício.", estrelas: 4, avaliado_em: new Date() },
      { usuario_id: usuario1Id, comentario: "Perdeu a pressão um pouco rápido.", estrelas: 3, avaliado_em: new Date() }
    ]
  }
]);

db.produtos.find().pretty();

//// 3. Consultas:
// 3.1. Escreva uma consulta para encontrar todos os produtos em uma categoria específica.
const categoriaId = db.categorias.findOne({ nome: "Camisetas" })._id;
const produtosCategoria = db.produtos.find({ categoria_id: categoriaId }).toArray();
produtosCategoria

// 3.2 Escreva uma consulta para encontrar todas as avaliações de um produto específico.
const avaliacoesProduto = db.produtos.find(
  { nome: "Smartphone X1" },
  { avaliacoes: 1, _id: 0 }
).toArray();
avaliacoesProduto

// 3.3 Escreva uma consulta para criar uma nova transação.
const usuarioId = db.usuarios.findOne({ nome: "Alice Martins" })._id;
const produtoId = db.produtos.findOne({ nome: "Smartphone X1" })._id;

db.transacoes.insertOne({
  usuario_id: usuarioId,
  produto_id: produtoId,
  quantidade: 1, 
  valor_total: NumberDecimal("1999.99"),
  status: "pendente",
  data_transacao: new Date()
});
const todasTransacoes = db.transacoes.find().toArray();
todasTransacoes;

// 3.4 Escreva uma consulta para atualizar a quantidade disponível de um produto após uma compra.
const produtoId2 = db.produtos.findOne({ nome: "Smartphone X1" })._id;
const quantidadeComprada = 1;
db.produtos.updateOne(
  { _id: produtoId2 },
  { $inc: { quantidade_disponivel: -quantidadeComprada } }
);
const produtoAtualizado = db.produtos.findOne({ _id: produtoId2 });
produtoAtualizado;

//// 4. Índices:
// Como buscamos produtos com frequência pelo campo nome,
// um índice neste campo acelerará essas buscas.
db.produtos.createIndex({ nome: 1 });

// Utilizamos categoria_id para buscar todos os produtos de uma determinada categoria, 
// então um índice neste campo melhora o desempenho para consultas
db.produtos.createIndex({ categoria_id: 1 });

// Para listar transações de um usuário específico, usamos usuario_id nas consultas 
// Um índice neste campo facilita o acesso rápido as transações de um determinado usuário.
db.transacoes.createIndex({ usuario_id: 1 });

// Para listar transações relacionadas a um produto em
// ordem cronológica (ou para filtros de data), um índice composto nos campos produto_id e
// data_transacao facilita essas consultas.
db.transacoes.createIndex({ produto_id: 1, data_transacao: -1 });

// O campo email é geralmente único e pode ser usado para identificar usuários rapidamente 
// um índice neste campo também garante sua unicidade se necessário.
db.usuarios.createIndex({ email: 1 }, { unique: true });

// listar índices
db.transacoes.getIndexes();

//// 5. Agregações
// 5.1 Escreva uma consulta de agregação para encontrar a média de avaliações para cada produto.
db.produtos.aggregate([
  { $unwind: "$avaliacoes" }, // Desmonta o array de avaliações
  { 
    $group: {
      _id: "$_id", // Agrupa por produto
      nome: { $first: "$nome" }, // Mantém o nome do produto
      media_avaliacoes: { $avg: "$avaliacoes.estrelas" } // Calcula a média das estrelas
    }
  }
]);

// 5.2 Escreva uma consulta de agregação para encontrar o total de vendas para cada categoria.
const smartphoneId = db.produtos.findOne({ nome: "Smartphone X1" })._id;
const notebookId = db.produtos.findOne({ nome: "Notebook Pro" })._id;
const camisetaId = db.produtos.findOne({ nome: "Camiseta Esportiva" })._id;
const livroId = db.produtos.findOne({ nome: "Livro: Aprenda MongoDB" })._id;
const bolaId = db.produtos.findOne({ nome: "Bola de Futebol" })._id;
const usuarioAliceId = db.usuarios.findOne({ nome: "Alice Martins" })._id;
const usuarioBrunoId = db.usuarios.findOne({ nome: "Bruno Souza" })._id;
const usuarioCarlaId = db.usuarios.findOne({ nome: "Carla Pereira" })._id;
db.transacoes.insertMany([
  { usuario_id: usuarioAliceId, produto_id: smartphoneId, quantidade: 1, valor_total: NumberDecimal("1999.99"), status: "concluída", data_transacao: new Date() },
  { usuario_id: usuarioBrunoId, produto_id: notebookId, quantidade: 2, valor_total: NumberDecimal("9999.80"), status: "concluída", data_transacao: new Date() },
  { usuario_id: usuarioCarlaId, produto_id: camisetaId, quantidade: 3, valor_total: NumberDecimal("149.70"), status: "pendente", data_transacao: new Date() },
  { usuario_id: usuarioAliceId, produto_id: livroId, quantidade: 1, valor_total: NumberDecimal("79.90"), status: "concluída", data_transacao: new Date() },
  { usuario_id: usuarioBrunoId, produto_id: bolaId, quantidade: 5, valor_total: NumberDecimal("449.95"), status: "concluída", data_transacao: new Date() }
]);

db.transacoes.aggregate([
  { 
    $match: { status: "concluída" } 
  },
  {
    $lookup: {
      from: "produtos",
      localField: "produto_id",
      foreignField: "_id",
      as: "produto_info"
    }
  },
  { $unwind: "$produto_info" },
  {
    $lookup: {
      from: "categorias",
      localField: "produto_info.categoria_id",
      foreignField: "_id",
      as: "categoria_info"
    }
  },
  { $unwind: "$categoria_info" },
  {
    $group: {
      _id: "$categoria_info.nome", 
      total_vendas: { $sum: "$valor_total" } 
    }
  }
]);

//// 6. Promoções:
// Implemente uma funcionalidade que permita aos vendedores oferecerem descontos 
// em seus produtos por um período limitado
db.produtos.updateMany(
  {},
  {
    $set: {
      desconto_percentual: null,
      inicio_promocao: null,
      fim_promocao: null
    }
  }
);

const produtoSmartphoneX1Id = db.produtos.findOne({ nome: "Smartphone X1" })._id;
db.produtos.updateOne(
  { _id: produtoSmartphoneX1Id },
  {
    $set: {
      desconto_percentual: NumberDecimal("10.0"),
      inicio_promocao: new Date("2024-11-20"),
      fim_promocao: new Date("2024-11-30")
    }
  }
);
const produtoSmartphoneX1Atualizado = db.produtos.findOne({ _id: produtoSmartphoneX1Id });
produtoSmartphoneX1Atualizado;

//// 7. Promoções:
// Implemente um sistema de pontos de fidelidade onde os usuários ganham pontos por cada compra,
// que podem ser usados para descontos em futuras compras.
db.usuarios.updateMany(
  {},
  {
    $set: { pontos: 0 }
  }
);
db.transacoes.updateMany(
  {},
  {
    $set: { pontos_ganhos: 0 }
  }
);

const usuarioPromocoesId = db.usuarios.findOne({ nome: "Alice Martins" })._id;
const produtoPromocoesId = db.produtos.findOne({ nome: "Smartphone X1" })._id;

const valorTotal = NumberDecimal("1999.99");
const pontosGanho = Math.floor(parseFloat(valorTotal) / 10); 

db.transacoes.insertOne({
  usuario_id: usuarioPromocoesId,
  produto_id: produtoPromocoesId,
  quantidade: 1,
  valor_total: valorTotal,
  status: "concluída",
  data_transacao: new Date(),
  pontos_ganhos: pontosGanho
});

db.usuarios.updateOne(
  { _id: usuarioPromocoesId },
  { $inc: { pontos: pontosGanho } }
);
const usuarioPromocoes = db.usuarios.findOne({ _id: usuarioPromocoesId });
usuarioPromocoes

//// 8. Resposta a Avaliações:
// Permita que os vendedores respondam às avaliações deixadas em seus produtos.
db.produtos.updateMany(
  { "avaliacoes.resposta": { $exists: false } },
  { $set: { "avaliacoes.$[].resposta": null } }
);

const produtoAvalicaoId = db.produtos.findOne({ nome: "Smartphone X1" })._id;
const avaliacaoId = db.produtos.findOne(
  { _id: produtoAvalicaoId },
  { "avaliacoes._id": 1 }
).avaliacoes[0]._id;

db.produtos.updateOne(
  { _id: produtoAvalicaoId, "avaliacoes._id": avaliacaoId },
  {
    $set: {
      "avaliacoes.$.resposta": {
        conteudo_resposta: "Agradecemos o feedback!",
        data_resposta: new Date()
      }
    }
  }
);
const produtoRespostaAvaliacao = db.produtos.findOne({ _id: produtoAvalicaoId })
produtoRespostaAvaliacao

//// 9. Geolocalização:
// 9.1 Os usuários podem definir sua localização geográfica.
db.usuarios.updateMany(
  {},
  {
    $set: { localizacao: { type: "Point", coordinates: [0, 0] } }
  }
);

// 9.2 Os produtos têm a localização geográfica do vendedor associada a eles.
db.produtos.updateMany(
  {},
  {
    $set: { localizacao_vendedor: { type: "Point", coordinates: [0, 0] } }
  }
);

// 9.3 Crie indices caso ache necessário.
db.usuarios.createIndex({ localizacao: "2dsphere" });
db.produtos.createIndex({ localizacao_vendedor: "2dsphere" });

// 9.4 Os usuários podem buscar produtos com base na proximidade geográfica, 
// podendo filtrar os resultados por raio de distância.
db.usuarios.updateMany(
  {},
  [
    {
      $set: {
        localizacao: {
          $switch: {
            branches: [
              { case: { $eq: ["$nome", "Alice Martins"] }, then: { type: "Point", coordinates: [-46.6333, -23.5505] } }, // São Paulo, Brasil
              { case: { $eq: ["$nome", "Bruno Souza"] }, then: { type: "Point", coordinates: [-43.2096, -22.9035] } }, // Rio de Janeiro, Brasil
              { case: { $eq: ["$nome", "Carla Pereira"] }, then: { type: "Point", coordinates: [-49.2643, -25.4296] } }, // Curitiba, Brasil
              { case: { $eq: ["$nome", "Diego Fernandes"] }, then: { type: "Point", coordinates: [-38.5014, -3.7172] } }, // Fortaleza, Brasil
              { case: { $eq: ["$nome", "Elaine Lima"] }, then: { type: "Point", coordinates: [-48.6692, -27.5954] } } // Florianópolis, Brasil
            ],
            default: { type: "Point", coordinates: [0, 0] } // Coordenadas padrão, caso necessário
          }
        }
      }
    }
  ]
);
db.produtos.updateMany(
  {},
  [
    {
      $set: {
        localizacao_vendedor: {
          $switch: {
            branches: [
              { case: { $eq: ["$nome", "Smartphone X1"] }, then: { type: "Point", coordinates: [-46.6333, -23.5505] } }, // São Paulo, Brasil
              { case: { $eq: ["$nome", "Notebook Pro"] }, then: { type: "Point", coordinates: [-43.2096, -22.9035] } }, // Rio de Janeiro, Brasil
              { case: { $eq: ["$nome", "Camiseta Esportiva"] }, then: { type: "Point", coordinates: [-49.2643, -25.4296] } }, // Curitiba, Brasil
              { case: { $eq: ["$nome", "Livro: Aprenda MongoDB"] }, then: { type: "Point", coordinates: [-38.5014, -3.7172] } }, // Fortaleza, Brasil
              { case: { $eq: ["$nome", "Bola de Futebol"] }, then: { type: "Point", coordinates: [-48.6692, -27.5954] } } // Florianópolis, Brasil
            ],
            default: { type: "Point", coordinates: [0, 0] } // Coordenadas padrão, caso necessário
          }
        }
      }
    }
  ]
);

const pontoReferencia = [-46.6388, -23.5569]; // São Paulo, Brasil
const raio = 55000; // 5 km

const produtosRaio = db.produtos.find({
  localizacao_vendedor: {
    $near: {
      $geometry: { type: "Point", coordinates: pontoReferencia },
      $maxDistance: raio
    }
  }
});
produtosRaio

// 9.5 Escreva uma consulta de agregação para encontrar a média de distância entre
// compradores e vendedores para transações concluídas.
db.transacoes.aggregate([
  { $match: { status: "concluída" } },
  {
    $lookup: {
      from: "produtos",
      localField: "produto_id",
      foreignField: "_id",
      as: "produto_info"
    }
  },
  { $unwind: "$produto_info" },
  {
    $lookup: {
      from: "usuarios",
      localField: "usuario_id",
      foreignField: "_id",
      as: "usuario_info"
    }
  },
  { $unwind: "$usuario_info" },
  {
    $addFields: {
      distancia: {
        $sqrt: {
          $add: [
            {
              $pow: [
                { $subtract: [ { $arrayElemAt: ["$produto_info.localizacao_vendedor.coordinates", 0] }, { $arrayElemAt: ["$usuario_info.localizacao.coordinates", 0] } ] },
                2
              ]
            },
            {
              $pow: [
                { $subtract: [ { $arrayElemAt: ["$produto_info.localizacao_vendedor.coordinates", 1] }, { $arrayElemAt: ["$usuario_info.localizacao.coordinates", 1] } ] },
                2
              ]
            }
          ]
        }
      }
    }
  },
  {
    $group: {
      _id: null,
      media_distancia: { $avg: "$distancia" }
    }
  }
]);

// 9.6 Escreva uma consulta de agregação para encontrar a categoria de produto
// mais popular em uma área geográfica específica.// Definir o ponto central e o raio de busca (em metros)
const longitude = -46.6333; // Exemplo: São Paulo, Brasil
const latitude = -23.5505;  // Exemplo: São Paulo, Brasil
const raioD = 5000 / 6378100; // Converter 5 km para unidades de raio esférico (em radianos)

db.transacoes.aggregate([
  // Filtrar apenas transações concluídas
  { $match: { status: "concluída" } },
  {
    $lookup: {
      from: "produtos",
      localField: "produto_id",
      foreignField: "_id",
      as: "produto_info"
    }
  },
  { $unwind: "$produto_info" },
  {
    $match: {
      "produto_info.localizacao_vendedor": {
        $geoWithin: {
          $centerSphere: [[longitude, latitude], raioD]
        }
      }
    }
  },
  {
    $lookup: {
      from: "categorias",
      localField: "produto_info.categoria_id",
      foreignField: "_id",
      as: "categoria_info"
    }
  },
  { $unwind: "$categoria_info" },
  {
    $group: {
      _id: "$categoria_info.nome",
      total_vendas: { $sum: 1 }
    }
  },
  { $sort: { total_vendas: -1 } },
  { $limit: 1 }
]);

//// 10. Relatórios:
// Crie consultas de agregação para gerar relatórios de vendas para os vendedores.
// 10.1.  Relatório de Vendas por Produto
// Este relatório mostra o total de vendas e a receita gerada para cada produto.
db.transacoes.aggregate([
  { $match: { status: "concluída" } },
  {
    $lookup: {
      from: "produtos",
      localField: "produto_id",
      foreignField: "_id",
      as: "produto_info"
    }
  },
  { $unwind: "$produto_info" },
  {
    $group: {
      _id: "$produto_info.nome",
      total_vendas: { $sum: 1 }, 
      receita_total: { $sum: "$valor_total" }
    }
  },
  { $sort: { total_vendas: -1 } }
]);


// 10.2 Relatório de Vendas por Categoria de Produto
// Este relatório apresenta o total de vendas e a receita gerada para cada categoria de produto.
db.transacoes.aggregate([
  { $match: { status: "concluída" } },
  {
    $lookup: {
      from: "produtos",
      localField: "produto_id",
      foreignField: "_id",
      as: "produto_info"
    }
  },
  { $unwind: "$produto_info" },
  {
    $lookup: {
      from: "categorias",
      localField: "produto_info.categoria_id",
      foreignField: "_id",
      as: "categoria_info"
    }
  },
  { $unwind: "$categoria_info" },
  {
    $group: {
      _id: "$categoria_info.nome", 
      total_vendas: { $sum: 1 }, 
      receita_total: { $sum: "$valor_total" }
    }
  },
  { $sort: { total_vendas: -1 } }
]);

// 10.3 Relatório de Vendas por Mês
// Este relatório agrupa as vendas por mês e calcula o total de vendas e a receita mensal.
db.transacoes.aggregate([
  { $match: { status: "concluída" } },
  {
    $addFields: {
      ano_mes: { $dateToString: { format: "%Y-%m", date: "$data_transacao" } }
    }
  },
  {
    $group: {
      _id: "$ano_mes",
      total_vendas: { $sum: 1 },
      receita_total: { $sum: "$valor_total" }
    }
  },
  { $sort: { _id: 1 } }
]);

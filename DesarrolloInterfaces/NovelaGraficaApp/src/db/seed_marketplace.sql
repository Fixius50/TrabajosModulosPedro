DO $$
DECLARE
  v_series_id uuid;
  v_chapter_id uuid;
  v_node_intro uuid;
  v_node_bar uuid;
  v_node_alley uuid;
  v_node_hack uuid;
  v_node_fight uuid;
  v_node_good_end uuid;
  v_node_bad_end uuid;
  v_node_secret_end uuid;
BEGIN

  -- 1. CREAR SERIE PREMIUM "NEON PROTOCOL"
  INSERT INTO series (title, description, cover_url, price, is_premium)
  VALUES ('Neon Protocol', 'Un thriller cyberpunk donde tus datos son tu vida.', 'https://picsum.photos/seed/neon/800/1200', 20, true)
  RETURNING id INTO v_series_id;

  INSERT INTO chapters (series_id, title, order_index, is_published)
  VALUES (v_series_id, 'Protocolo de Inicio', 1, true)
  RETURNING id INTO v_chapter_id;

  -- 2. NODOS
  -- Usamos picsum como placeholder visual
  
  -- Intro: Oficina
  INSERT INTO story_nodes (chapter_id, image_url, type)
  VALUES (v_chapter_id, 'https://picsum.photos/seed/cyber1/1920/1080', 'panel')
  RETURNING id INTO v_node_intro;

  -- Rama A: Bar
  INSERT INTO story_nodes (chapter_id, image_url, type)
  VALUES (v_chapter_id, 'https://picsum.photos/seed/cyberbar/1920/1080', 'panel')
  RETURNING id INTO v_node_bar;

  -- Rama B: Callejón
  INSERT INTO story_nodes (chapter_id, image_url, type)
  VALUES (v_chapter_id, 'https://picsum.photos/seed/cyberalley/1920/1080', 'panel')
  RETURNING id INTO v_node_alley;

  -- Evento: Hacking
  INSERT INTO story_nodes (chapter_id, image_url, type)
  VALUES (v_chapter_id, 'https://picsum.photos/seed/hacking/1920/1080', 'panel')
  RETURNING id INTO v_node_hack;

  -- Evento: Pelea
  INSERT INTO story_nodes (chapter_id, image_url, type)
  VALUES (v_chapter_id, 'https://picsum.photos/seed/fight/1920/1080', 'panel')
  RETURNING id INTO v_node_fight;

  -- Final Bueno
  INSERT INTO story_nodes (chapter_id, image_url, type)
  VALUES (v_chapter_id, 'https://picsum.photos/seed/succcess/1920/1080', 'panel')
  RETURNING id INTO v_node_good_end;

  -- Final Malo
  INSERT INTO story_nodes (chapter_id, image_url, type)
  VALUES (v_chapter_id, 'https://picsum.photos/seed/fail/1920/1080', 'panel')
  RETURNING id INTO v_node_bad_end;

  -- Final Secreto
  INSERT INTO story_nodes (chapter_id, image_url, type)
  VALUES (v_chapter_id, 'https://picsum.photos/seed/secret/1920/1080', 'panel')
  RETURNING id INTO v_node_secret_end;

  -- 3. DIÁLOGOS
  INSERT INTO dialogues (node_id, speaker_name, content, position_x, position_y) VALUES
  (v_node_intro, 'V', 'Tengo el chip. Ahora necesito entregarlo. ¿Dónde me reúno con el contacto?', 0.5, 0.8),
  
  (v_node_bar, 'Barman', '¿Buscas a Zero? Está en el reservado, pero hay guardias de la Corp.', 0.2, 0.5),
  (v_node_alley, 'V', 'Demasiado tranquilo... Parece una emboscada.', 0.5, 0.8),
  
  (v_node_hack, 'Sistema', 'Acceso denegado. Iniciando contramedidas...', 0.5, 0.5),
  (v_node_fight, 'Guardia', '¡Alto ahí! ¡Entréganos el chip!', 0.8, 0.4),
  
  (v_node_good_end, 'Zero', 'Buen trabajo, V. La resistencia te lo agradece.', 0.5, 0.8),
  (v_node_bad_end, 'Narrador', 'Te atraparon. Tus datos han sido borrados.', 0.5, 0.5),
  (v_node_secret_end, 'IA Central', 'Bienvenido a la verdadera realidad. Simulación finalizada.', 0.5, 0.5);

  -- 4. DECISIONES
  
  -- Intro decision
  INSERT INTO story_choices (from_node_id, to_node_id, label) VALUES 
  (v_node_intro, v_node_bar, 'Ir al Club Neon'),
  (v_node_intro, v_node_alley, 'Tomar el atajo del callejón');

  -- Bar decision
  INSERT INTO story_choices (from_node_id, to_node_id, label) VALUES 
  (v_node_bar, v_node_hack, 'Hackear la seguridad del reservado'),
  (v_node_bar, v_node_fight, 'Entrar a la fuerza');

  -- Alley decision
  INSERT INTO story_choices (from_node_id, to_node_id, label) VALUES 
  (v_node_alley, v_node_fight, 'Enfrentar a la sombra'),
  (v_node_alley, v_node_bad_end, 'Huir (Los drones son más rápidos)');

  -- Outcomes
  INSERT INTO story_choices (from_node_id, to_node_id, label) VALUES 
  (v_node_hack, v_node_secret_end, 'Sobreescribir protocolo maestro'),
  (v_node_hack, v_node_bad_end, 'Fallar el hackeo');

  INSERT INTO story_choices (from_node_id, to_node_id, label) VALUES 
  (v_node_fight, v_node_good_end, 'Vencer al guardia'),
  (v_node_fight, v_node_bad_end, 'Ser derrotado');

END $$;

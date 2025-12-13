DO $$
DECLARE
  -- Variables para guardar los IDs generados automáticamente
  v_series_id uuid;
  v_chapter_id uuid;
  v_node_start uuid;
  v_node_stealth uuid;
  v_node_shout uuid;
  v_node_end uuid;
BEGIN

  -- 1. CREAR LA SERIE Y EL CAPÍTULO
  INSERT INTO series (title, description)
  VALUES ('Demos Técnicas', 'Serie de pruebas para el motor Webtoon 2.0')
  RETURNING id INTO v_series_id;

  INSERT INTO chapters (series_id, title, order_index, is_published)
  VALUES (v_series_id, 'El Misterio del Bosque Digital', 1, true)
  RETURNING id INTO v_chapter_id;

  -- 2. CREAR LOS NODOS (VIÑETAS)
  -- Nota: Usamos tus imágenes del JSON.
  
  -- Nodo A: START
  INSERT INTO story_nodes (chapter_id, image_url, type)
  VALUES (v_chapter_id, '/assets/images/panel1.png', 'panel')
  RETURNING id INTO v_node_start;

  -- Nodo B: CAMINO SIGILOSO
  INSERT INTO story_nodes (chapter_id, image_url, type)
  VALUES (v_chapter_id, '/assets/images/panel2.png', 'panel')
  RETURNING id INTO v_node_stealth;

  -- Nodo C: GRITO (GLITCH)
  INSERT INTO story_nodes (chapter_id, image_url, type)
  VALUES (v_chapter_id, '/assets/images/panel3.png', 'panel')
  RETURNING id INTO v_node_shout;

  -- Nodo D: FINAL (Reusando panel 1 como placeholder si falta imagen final, o asumiendo el nombre del script)
  -- El script original decia 'to_be_continued.jpg', lo mantengo pero ojo que no existe en local aun
  INSERT INTO story_nodes (chapter_id, image_url, type)
  VALUES (v_chapter_id, '/assets/images/panel1.png', 'panel') 
  RETURNING id INTO v_node_end;

  -- 3. INSERTAR DIÁLOGOS (TEXTOS)
  -- Separamos el texto de la imagen para tu accesibilidad
  
  INSERT INTO dialogues (node_id, speaker_name, content, position_y) VALUES
  (v_node_start, 'Narrador', 'Te encuentras frente a la entrada del bosque prohibido. Una neblina digital cubre el camino.', 85),
  (v_node_stealth, 'Narrador', 'Avanzas entre los árboles de código binario sin hacer ruido. Ves una luz azul a lo lejos.', 85),
  (v_node_shout, 'Sistema', '¡ALERTA! Tu grito despierta a los Glitches. Tienes que correr.', 85),
  (v_node_end, '', 'Continuará...', 50);

  -- 4. CONECTAR LAS DECISIONES (LÓGICA RAMIFICADA)
  -- Aquí es donde la magia ocurre. Conectamos START con las opciones.
  
  -- Opción 1: Entrar sigilosamente -> Lleva al nodo Stealth
  INSERT INTO story_choices (from_node_id, to_node_id, label)
  VALUES (v_node_start, v_node_stealth, 'Entrar sigilosamente');

  -- Opción 2: Gritar -> Lleva al nodo Shout
  INSERT INTO story_choices (from_node_id, to_node_id, label)
  VALUES (v_node_start, v_node_shout, 'Gritar "¡Hola Mundo!"');
  
  -- Siguientes pasos
  INSERT INTO story_choices (from_node_id, to_node_id, label)
  VALUES (v_node_stealth, v_node_end, 'Siguiente');
  
  INSERT INTO story_choices (from_node_id, to_node_id, label)
  VALUES (v_node_shout, v_node_end, 'Huir');

END $$;

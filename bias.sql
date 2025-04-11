DROP TABLE IF EXISTS usuarios_bias;
DROP TABLE IF EXISTS bias;

CREATE TABLE IF NOT EXISTS bias (
    id SERIAL PRIMARY KEY,
    grupo VARCHAR(100),
    idol VARCHAR(100),
    imagen_path VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS usuarios_bias (
    id SERIAL PRIMARY KEY,
    telefono VARCHAR(20),
    usuario VARCHAR(100),
    grupo VARCHAR(100),
    bias_id INT REFERENCES bias(id)
);

INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (1, 'Twice', 'Dahyun', 'images_bias/twice_dahyun.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (2, 'RedVelvet', 'Yeri', 'images_bias/redvelvet_yeri.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (3, 'NMIXX', 'Haewon', 'images_bias/nmixx_haewon.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (4, 'BlackPink', 'Lisa', 'images_bias/blackpink_lisa.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (5, 'le sserafim', 'Chaewon', 'images_bias/lesserafim_chaewon.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (6, 'G(idol)', 'So Yeon', 'images_bias/gidol_soyeon.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (7, 'IVE', 'Rei', 'images_bias/ive_rei.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (8, 'ITZY', 'Ye Ji', 'images_bias/itzy_yeji.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (9, 'Aespa', 'Ning Ning', 'images_bias/aespa_ningning.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (10, 'NewJeans', 'Danielle', 'images_bias/newjeans_danielle.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (11, 'Solostas', 'Somi', 'images_bias/solostas_somi.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (12, 'Cignature', 'Chloe', 'images_bias/cignature_chloe.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (13, 'Kiss of life', 'Natty', 'images_bias/kissoflife_natty.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (14, 'BTS', 'V', 'images_bias/bts_v.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (15, 'Twice', 'Momo', 'images_bias/twice_momo.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (16, 'RedVelvet', 'Irene', 'images_bias/redvelvet_irene.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (17, 'NMIXX', 'Jiwoo', 'images_bias/nmixx_jiwoo.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (18, 'BlackPink', 'Rose', 'images_bias/blackpink_rose.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (19, 'le sserafim', 'Kazuha', 'images_bias/lesserafim_kazuha.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (20, 'G(idol)', 'Minnie', 'images_bias/gidol_minnie.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (21, 'IVE', 'Yu Jin', 'images_bias/ive_yujin.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (22, 'ITZY', 'LIA', 'images_bias/itzy_lia.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (23, 'Aespa', 'Winter', 'images_bias/aespa_winter.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (24, 'NewJeans', 'Haerin', 'images_bias/newjeans_haerin.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (25, 'Solostas', 'Adora', 'images_bias/solostas_adora.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (26, 'Cignature', 'Seline', 'images_bias/cignature_seline.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (27, 'Kiss of life', 'Julie', 'images_bias/kissoflife_julie.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (28, 'BTS', 'Jungkook', 'images_bias/bts_jungkook.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (29, 'Twice', 'Jihyo', 'images_bias/twice_jihyo.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (30, 'RedVelvet', 'Joy', 'images_bias/redvelvet_joy.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (31, 'NMIXX', 'Lily', 'images_bias/nmixx_lily.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (32, 'BlackPink', 'Jisoo', 'images_bias/blackpink_jisoo.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (33, 'le sserafim', 'Yun Jin', 'images_bias/lesserafim_yunjin.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (34, 'G(idol)', 'Shu Hua', 'images_bias/gidol_shuhua.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (35, 'IVE', 'Won Young', 'images_bias/ive_wonyoung.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (36, 'ITZY', 'Ryu Jin', 'images_bias/itzy_ryujin.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (37, 'Aespa', 'Giselle', 'images_bias/aespa_giselle.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (38, 'NewJeans', 'Hanni', 'images_bias/newjeans_hanni.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (39, 'Solostas', 'Eunbi', 'images_bias/solostas_eunbi.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (40, 'Cignature', 'Jee Won', 'images_bias/cignature_jeewon.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (41, 'Kiss of life', 'Belle', 'images_bias/kissoflife_belle.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (42, 'BTS', 'Jimin', 'images_bias/bts_jimin.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (43, 'Twice', 'Sana', 'images_bias/twice_sana.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (44, 'RedVelvet', 'Seulgi', 'images_bias/redvelvet_seulgi.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (45, 'NMIXX', 'Sullyoon', 'images_bias/nmixx_sullyoon.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (46, 'BlackPink', 'Jennie', 'images_bias/blackpink_jennie.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (47, 'le sserafim', 'Eun-chae', 'images_bias/lesserafim_eunchae.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (48, 'G(idol)', 'Mi Yeon', 'images_bias/gidol_miyeon.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (49, 'IVE', 'Liz', 'images_bias/ive_liz.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (50, 'ITZY', 'Shin Yu Na', 'images_bias/itzy_shinyuna.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (51, 'Aespa', 'Karina', 'images_bias/aespa_karina.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (52, 'NewJeans', 'Hyein', 'images_bias/newjeans_hyein.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (53, 'Solostas', 'IU', 'images_bias/solostas_iu.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (54, 'Cignature', '', 'images_bias/cignature_haneul.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (55, 'Kiss of life', 'Haneul', 'images_bias/kissoflife_pene.jpg');
INSERT INTO bias (id, grupo, idol, imagen_path) VALUES (56, 'BTS', 'Pene', 'images_bias/kissoflife_pene.jpg');

INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215544801001', 'Omi', 'Twice', 1);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215544801001', 'Omi', 'RedVelvet', 2);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215544801001', 'Omi', 'NMIXX', 3);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215544801001', 'Omi', 'BlackPink', 4);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215544801001', 'Omi', 'le sserafim', 5);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215544801001', 'Omi', 'G(idol)', 6);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215544801001', 'Omi', 'IVE', 7);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215544801001', 'Omi', 'ITZY', 8);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215544801001', 'Omi', 'Aespa', 9);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215544801001', 'Omi', 'NewJeans', 10);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215544801001', 'Omi', 'Solostas', 11);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215544801001', 'Omi', 'Cignature', 12);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215544801001', 'Omi', 'Kiss of life', 13);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215544801001', 'Omi', 'BTS', 14);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215615916079', 'Leches', 'Twice', 15);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215615916079', 'Leches', 'RedVelvet', 16);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215615916079', 'Leches', 'NMIXX', 17);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215615916079', 'Leches', 'BlackPink', 18);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215615916079', 'Leches', 'le sserafim', 19);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215615916079', 'Leches', 'G(idol)', 20);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215615916079', 'Leches', 'IVE', 21);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215615916079', 'Leches', 'ITZY', 22);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215615916079', 'Leches', 'Aespa', 23);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215615916079', 'Leches', 'NewJeans', 24);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215615916079', 'Leches', 'Solostas', 25);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215615916079', 'Leches', 'Cignature', 26);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215615916079', 'Leches', 'Kiss of life', 27);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215615916079', 'Leches', 'BTS', 28);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215578992407', 'Angelito', 'Twice', 29);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215578992407', 'Angelito', 'RedVelvet', 30);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215578992407', 'Angelito', 'NMIXX', 31);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215578992407', 'Angelito', 'BlackPink', 32);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215578992407', 'Angelito', 'le sserafim', 33);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215578992407', 'Angelito', 'G(idol)', 34);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215578992407', 'Angelito', 'IVE', 35);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215578992407', 'Angelito', 'ITZY', 36);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215578992407', 'Angelito', 'Aespa', 37);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215578992407', 'Angelito', 'NewJeans', 38);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215578992407', 'Angelito', 'Solostas', 39);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215578992407', 'Angelito', 'Cignature', 40);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215578992407', 'Angelito', 'Kiss of life', 41);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215578992407', 'Angelito', 'BTS', 42);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215529112811', 'Mau', 'Twice', 43);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215529112811', 'Mau', 'RedVelvet', 44);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215529112811', 'Mau', 'NMIXX', 45);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215529112811', 'Mau', 'BlackPink', 46);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215529112811', 'Mau', 'le sserafim', 47);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215529112811', 'Mau', 'G(idol)', 48);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215529112811', 'Mau', 'IVE', 49);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215529112811', 'Mau', 'ITZY', 50);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215529112811', 'Mau', 'Aespa', 51);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215529112811', 'Mau', 'NewJeans', 52);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215529112811', 'Mau', 'Solostas', 53);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215529112811', 'Mau', 'Cignature', 54);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215529112811', 'Mau', 'Kiss of life', 55);
INSERT INTO usuarios_bias (telefono, usuario, grupo, bias_id) VALUES ('5215529112811', 'Mau', 'BTS', 56);
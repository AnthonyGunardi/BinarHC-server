ALTER TABLE `indonesia_cities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `indonesia_cities_province_id_foreign` (`province_id`);
	
ALTER TABLE `indonesia_districts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `indonesia_districts_city_id_foreign` (`city_id`);
	
ALTER TABLE `indonesia_provinces`
  ADD PRIMARY KEY (`id`);
	
ALTER TABLE `indonesia_villages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `indonesia_villages_district_code_foreign` (`district_id`);
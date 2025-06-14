<!DOCTYPE html>
<html dir="rtl" lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width, initial-scale=1">
				<meta name="csrf-token" content="{{ csrf_token() }}">
				<title inertia>{{ 'نبض' }}</title>
				@viteReactRefresh
				@vite(['resources/css/app.css', 'resources/js/app.jsx'])
				@routes
				@inertiaHead


				<link rel="preconnect" href="https://fonts.googleapis.com">
				<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

				<link href="https://fonts.googleapis.com/css2?family=Baloo+Bhaijaan+2:wght@400..800&display=swap" rel="stylesheet">
				<style>
								body {
												font-family: 'Baloo Bhaijaan 2', sans-serif;
								}
				</style>
				<!-- Google tag (gtag.js) -->
				<script async src="https://www.googletagmanager.com/gtag/js?id=G-B0D43DKL1S"></script>
				<script>
								window.dataLayer = window.dataLayer || [];

								function gtag() {
												dataLayer.push(arguments);
								}
								gtag('js', new Date());

								gtag('config', 'G-B0D43DKL1S');
				</script>

</head>

<body class="font-sans antialiased">
				@inertia
</body>

</html>

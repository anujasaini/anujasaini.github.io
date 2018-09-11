<?php
	$relative_path = "../";
	$current_page = "T-shirt design";
	// $navbar_style = "navbar-static-top";
?>

<!DOCTYPE html>

<head>
	<title>T-shirt design contest | Reflux '16</title>
	<?php include "$relative_path"."embeds/include.php"; ?>
	<link rel="stylesheet" href="../css/tshirt.css" type="text/css" />
</head>

<body>

	<?php include '../embeds/navbar.php'; ?>

	<div class="page-content">
		
		<div class="container">
			
			<h2 class="text-center uppercase">Design T-shirt for Reflux 2016</h2>
			<br>

			<div class="jumbotron" id="ruleBox">

				<?php if($tshirt_closed!=true) { ?>

				<h3>Rules</h3>
				<ul>
					<li>Only individual participation is allowed.</li>
					<li>Each contestant is eligible to make only one entry</li>
					<li>Multiple contestants can take part from a college</li>
					<li>Design must be based on Reflux 2016's theme : "Climate Unchange, for a better tomorrow"</li>
					<li>It is mandatory to include the text "Reflux 4.0" and "IIT Guwahati" on the t-shirt</li>
					<li>Do <span class="dotted">not</span> include IIT-Guwahati's logo anywhere on the t-shirt</li>
				</ul>
				<h3>Judging criteria</h3>
				<ul>
					<li>50% weightage is given to the no. of likes and shares of your design's post on <a class="customLink dotted" href="https://www.fb.com/Reflux.iitg" target="_blank">Reflux's facebook page</a></li>
					<li>Rest of the points will be given by the contest judges for your originality and creativity.</li>
					<strong>Note:</strong> The decision of the judges and the organizers shall be final and abiding.
				</ul>
				<!-- <h3 class="text-center"><button class="btn btn-primary btn-lg" id="showFormBtn">Submit a Design</button></h3> -->

				<hr>
				<h3 class="text-center" style="color: hsl(120,100%,25%);">Submit your design</h3>
				<div class="row" id="form">
				<div class="col-lg-6 col-md-8 col-sm-10 col-lg-offset-3 col-md-offset-2 col-sm-offset-1">
					<div class="form-group">
						<input type="text" name="name" class="form-control customInput" placeholder="Name *" autocomplete="off">
					</div>
					<div class="form-group">
						<input type="text" name="institute" class="form-control customInput" placeholder="Institution name *" autocomplete="off">
					</div>
					<div class="form-group">
						<input type="text" name="email" class="form-control customInput" placeholder="Email-ID *" autocomplete="off">
					</div>
					<div class="form-group">
						<input type="text" name="phone" class="form-control customInput" placeholder="Phone No. *" autocomplete="off">
					</div>
					<div class="form-group">
						<label>Please provide your Facebook profile link so that we can tag you in your design's post on our page. This may be beneficial for you in the contest.</label>
						<input type="text" name="fb" class="form-control customInput" placeholder="Facebook profile link" autocomplete="off">
					</div>
					<div class="form-group">
						<label>Upload a JPEG/PNG format file of your design</label>
						<input type="file" name="file">
					</div>
					<div class="form-group text-center">
						<input type="submit" class="btn btn-primary" value="Finish">
					</div>
				</div>
				</div>
				
				<?php } else { ?>

				<h3 class="text-center">T-shirt design contest has ended for this year.</h3>
				<h4 class="text-center">Do come back in the next edition of Reflux</h4>

				<?php } ?>

			</div>

		</div>
		
	</div>
	
	<script type="text/javascript" src="../js/tshirt.js"></script>
		
</body>